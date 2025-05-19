#!/bin/bash

# Setup admin user script for TaskaLoop

# ANSI color codes for prettier output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TaskaLoop Admin Setup ===${NC}"
echo

# Default admin credentials (can be overridden via command line)
ADMIN_EMAIL=${1:-"admin@taskaloop.com"}
ADMIN_PASSWORD=${2:-"admin123"}
ADMIN_NAME=${3:-"Admin User"}

# Function to check if Firebase emulators are running
check_emulators() {
    echo -e "${YELLOW}Checking if Firebase emulators are running...${NC}"
    
    # Check if Firebase Auth emulator is running on port 9099
    if nc -z localhost 9099 2>/dev/null; then
        echo -e "${GREEN}Firebase Auth emulator is running on port 9099.${NC}"
        AUTH_RUNNING=true
    else
        echo -e "${RED}Firebase Auth emulator is NOT running on port 9099.${NC}"
        AUTH_RUNNING=false
    fi
    
    # Check if Firestore emulator is running on port 8080
    if nc -z localhost 8080 2>/dev/null; then
        echo -e "${GREEN}Firestore emulator is running on port 8080.${NC}"
        FIRESTORE_RUNNING=true
    else
        echo -e "${RED}Firestore emulator is NOT running on port 8080.${NC}"
        FIRESTORE_RUNNING=false
    fi
    
    # Return true if both emulators are running
    if [ "$AUTH_RUNNING" = true ] && [ "$FIRESTORE_RUNNING" = true ]; then
        return 0
    else
        return 1
    fi
}

# Start Firebase emulators if not already running
start_emulators() {
    echo -e "${YELLOW}Starting Firebase emulators...${NC}"
    
    # Start emulators in the background
    firebase emulators:start --only auth,firestore &
    
    # Save PID to kill later if needed
    EMULATOR_PID=$!
    
    # Wait for emulators to start
    echo -e "${YELLOW}Waiting for emulators to start...${NC}"
    sleep 10
    
    # Check if emulators are running
    check_emulators
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Firebase emulators started successfully.${NC}"
        return 0
    else
        echo -e "${RED}Failed to start Firebase emulators.${NC}"
        return 1
    fi
}

# Create admin user using the create-admin.js script
create_admin_user() {
    echo -e "${YELLOW}Creating admin user...${NC}"
    echo -e "Email: ${BLUE}$ADMIN_EMAIL${NC}"
    echo -e "Password: ${BLUE}$ADMIN_PASSWORD${NC}"
    echo -e "Name: ${BLUE}$ADMIN_NAME${NC}"
    
    # Run the admin creation script
    node scripts/create-admin.js "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "$ADMIN_NAME"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Admin user created successfully.${NC}"
        return 0
    else
        echo -e "${RED}Failed to create admin user.${NC}"
        return 1
    fi
}

# Main script execution
echo -e "${YELLOW}Setting up TaskaLoop admin user...${NC}"

# Check if emulators are already running
check_emulators
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Firebase emulators are already running.${NC}"
else
    echo -e "${YELLOW}Firebase emulators are not running. Starting them now...${NC}"
    start_emulators
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to start Firebase emulators. Please start them manually and try again.${NC}"
        exit 1
    fi
fi

# Create admin user
create_admin_user

# Summary
echo
echo -e "${BLUE}=== Setup Complete ===${NC}"
echo -e "${GREEN}Admin user has been created with the following credentials:${NC}"
echo -e "  Email:    ${BLUE}$ADMIN_EMAIL${NC}"
echo -e "  Password: ${BLUE}$ADMIN_PASSWORD${NC}"
echo -e "  Name:     ${BLUE}$ADMIN_NAME${NC}"
echo
echo -e "${YELLOW}You can now log in at:${NC} ${BLUE}http://localhost:3000/admin/login${NC}"
echo

exit 0 