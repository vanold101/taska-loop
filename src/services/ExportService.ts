import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { Trip, TripItem } from '@/context/TaskContext';
import { formatValueWithUnit } from './UnitConversionService';

// Helper to format currency
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined) return '$0.00';
  return `$${value.toFixed(2)}`;
};

// Helper to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Export a trip to PDF format
 */
export const exportTripToPDF = (trip: Trip): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Set font styles
  const titleFont = 16;
  const headingFont = 12;
  const normalFont = 10;
  const smallFont = 8;
  
  // Initial y position
  let y = 20;
  
  // Add title
  doc.setFontSize(titleFont);
  doc.setFont('helvetica', 'bold');
  const title = `Shopping Trip to ${trip.store}`;
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  // Add date and status
  doc.setFontSize(normalFont);
  doc.setFont('helvetica', 'normal');
  const dateText = `Date: ${formatDate(trip.date)}`;
  doc.text(dateText, margin, y);
  y += 6;
  
  const statusText = `Status: ${trip.status.toUpperCase()}`;
  doc.text(statusText, margin, y);
  y += 6;
  
  // Add shopper
  if (trip.shopper) {
    const shopperText = `Shopper: ${trip.shopper.name}`;
    doc.text(shopperText, margin, y);
    y += 6;
  }
  
  // Add participants if available
  if (trip.participants && trip.participants.length > 0) {
    const participantsText = `Participants: ${trip.participants.map(p => p.name).join(', ')}`;
    doc.text(participantsText, margin, y);
    y += 10;
  } else {
    y += 4;
  }
  
  // Add items section
  doc.setFontSize(headingFont);
  doc.setFont('helvetica', 'bold');
  doc.text('Items:', margin, y);
  y += 8;
  
  // Table headers
  doc.setFontSize(normalFont);
  doc.setFont('helvetica', 'bold');
  
  const col1Width = 20; // #
  const col2Width = 100; // Name
  const col3Width = 60; // Quantity/Unit
  const col4Width = 45; // Price
  const col5Width = 35; // Status
  
  doc.text('#', margin, y);
  doc.text('Item', margin + col1Width, y);
  doc.text('Quantity', margin + col1Width + col2Width, y);
  doc.text('Price', margin + col1Width + col2Width + col3Width, y);
  doc.text('Status', margin + col1Width + col2Width + col3Width + col4Width, y);
  y += 6;
  
  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  const uncheckedItems = trip.items.filter(item => !item.checked);
  const checkedItems = trip.items.filter(item => item.checked);
  
  // Function to add an item to the PDF
  const addItemToPDF = (item: TripItem, index: number) => {
    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    // Item row
    doc.text(`${index + 1}`, margin, y);
    
    // Name with truncation if too long
    const itemName = item.name.length > 30 ? item.name.substring(0, 27) + '...' : item.name;
    doc.text(itemName, margin + col1Width, y);
    
    // Quantity with unit
    const quantityText = formatValueWithUnit(item.quantity, item.unit || 'ea');
    doc.text(quantityText, margin + col1Width + col2Width, y);
    
    // Price
    const priceText = item.price ? formatCurrency(item.price) : '—';
    doc.text(priceText, margin + col1Width + col2Width + col3Width, y);
    
    // Status
    const statusText = item.checked ? 'Checked' : 'Unchecked';
    doc.text(statusText, margin + col1Width + col2Width + col3Width + col4Width, y);
    
    y += 6;
  };
  
  // Add unchecked items
  doc.setFontSize(smallFont);
  doc.setTextColor(0, 0, 0);
  uncheckedItems.forEach((item, index) => {
    addItemToPDF(item, index);
  });
  
  // Add a small gap between sections
  y += 2;
  
  // Add checked items if any
  if (checkedItems.length > 0) {
    doc.setFontSize(normalFont);
    doc.setFont('helvetica', 'bold');
    doc.text('Checked Items:', margin, y);
    y += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(smallFont);
    doc.setTextColor(100, 100, 100); // Grey text for checked items
    
    checkedItems.forEach((item, index) => {
      addItemToPDF(item, index + uncheckedItems.length);
    });
  }
  
  // Add a summary at the bottom
  y += 4;
  doc.setFontSize(normalFont);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  const total = trip.items.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalText = `Total: ${formatCurrency(total)}`;
  doc.text(totalText, pageWidth - margin, y, { align: 'right' });
  
  // Add date of export at the bottom
  y = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(smallFont);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated on ${new Date().toLocaleString()}`, margin, y);
  
  // Save the PDF
  doc.save(`shopping-trip-${trip.store.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export a trip to CSV format
 */
export const exportTripToCSV = (trip: Trip): void => {
  // Prepare data for CSV
  const headers = ['Item', 'Quantity', 'Unit', 'Price', 'Status', 'Category', 'Added By'];
  const rows = trip.items.map(item => [
    item.name,
    item.quantity.toString(),
    item.unit || 'ea',
    item.price ? item.price.toString() : '',
    item.checked ? 'Checked' : 'Unchecked',
    item.category || '',
    item.addedBy?.name || ''
  ]);
  
  // Add trip information as metadata
  const metaHeaders = ['Trip Information', '', '', '', '', '', ''];
  const metaRows = [
    ['Store', trip.store, '', '', '', '', ''],
    ['Date', formatDate(trip.date), '', '', '', '', ''],
    ['Status', trip.status, '', '', '', '', ''],
    ['Shopper', trip.shopper?.name || '', '', '', '', '', ''],
    ['Participants', trip.participants.map(p => p.name).join(', '), '', '', '', '', ''],
    ['Total Cost', trip.items.reduce((sum, item) => sum + (item.price || 0), 0).toString(), '', '', '', '', ''],
    ['', '', '', '', '', '', ''] // Empty row for spacing
  ];
  
  // Combine all data
  const allRows = [...metaRows, metaHeaders, ...rows];
  
  // Convert to CSV
  const csv = Papa.unparse(allRows);
  
  // Create a download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `shopping-trip-${trip.store.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export multiple trips to CSV format (for history exports)
 */
export const exportTripsHistoryToCSV = (trips: Trip[]): void => {
  // Prepare data for CSV
  const headers = ['Trip ID', 'Store', 'Date', 'Status', 'Shopper', 'Total Items', 'Total Cost'];
  const rows = trips.map(trip => {
    const totalItems = trip.items.length;
    const totalCost = trip.items.reduce((sum, item) => sum + (item.price || 0), 0);
    
    return [
      trip.id,
      trip.store,
      formatDate(trip.date),
      trip.status,
      trip.shopper?.name || '',
      totalItems.toString(),
      totalCost.toString()
    ];
  });
  
  // Combine headers and rows
  const allRows = [headers, ...rows];
  
  // Convert to CSV
  const csv = Papa.unparse(allRows);
  
  // Create a download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `shopping-history-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 