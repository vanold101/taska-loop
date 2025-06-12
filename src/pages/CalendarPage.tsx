import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MoreHorizontal,
  Plus,
  ShoppingCart,
  Users,
  ListTodo
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Sidebar } from "../components/Sidebar"

export default function CalendarPage() {
  const navigate = useNavigate();
  
  // Current month and year
  const currentMonth = "May"
  const currentYear = 2025

  // Days of the week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Calendar days (simplified for example)
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const day = i - 3 // Start from April 28 (3 days before May 1)
    return {
      date: day <= 0 ? `Apr ${30 + day}` : day > 31 ? `Jun ${day - 31}` : `May ${day}`,
      day: day,
      isCurrentMonth: day > 0 && day <= 31,
      hasEvents: [1, 5, 10, 15, 20, 22, 25].includes(day),
      events:
        day === 20
          ? [
              { title: "Grocery Shopping", time: "3:30 PM", type: "shopping" },
              { title: "Dinner with Alex", time: "7:00 PM", type: "social" },
            ]
          : day === 22
            ? [{ title: "Pay Internet Bill", time: "All day", type: "task" }]
            : day === 15
              ? [{ title: "Household Supplies", time: "11:00 AM", type: "shopping" }]
              : [],
    }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="md:pl-64 pb-16 md:pb-0">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
              <p className="text-slate-500">Plan and manage your schedule</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center border border-slate-200 rounded-md">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-2 font-medium">
                  {currentMonth} {currentYear}
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Select defaultValue="month">
                <SelectTrigger className="w-[120px] border-slate-200">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>

          {/* Calendar View */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 border-b border-slate-200">
                {daysOfWeek.map((day, index) => (
                  <div
                    key={day}
                    className={`py-2 text-center text-sm font-medium ${
                      index === 0 || index === 6 ? "text-red-500" : "text-slate-700"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 grid-rows-5 divide-x divide-y divide-slate-200">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 ${
                      day.isCurrentMonth ? "bg-white" : "bg-slate-50"
                    } hover:bg-slate-50 transition-colors`}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-sm font-medium ${
                          day.isCurrentMonth
                            ? day.date.includes("May 20")
                              ? "bg-teal-100 text-teal-800 w-6 h-6 rounded-full flex items-center justify-center"
                              : "text-slate-700"
                            : "text-slate-400"
                        }`}
                      >
                        {day.day <= 0 ? 30 + day.day : day.day > 31 ? day.day - 31 : day.day}
                      </span>
                      {day.hasEvents && (
                        <div className="flex">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        </div>
                      )}
                    </div>

                    {/* Events */}
                    <div className="mt-1 space-y-1">
                      {day.events.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={`text-xs p-1 rounded truncate ${
                            event.type === "shopping"
                              ? "bg-blue-100 text-blue-800"
                              : event.type === "social"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                          <div className="truncate font-medium">{event.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Today, May 20</CardTitle>
                      <CardDescription>2 events scheduled</CardDescription>
                    </div>
                    <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Today</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    {/* Event 1 */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">Grocery Shopping</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm text-slate-500">3:30 PM</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm text-slate-500">Trader Joe's</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Event</DropdownMenuItem>
                          <DropdownMenuItem>View Shopping List</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Event 2 */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">Dinner with Alex</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm text-slate-500">7:00 PM</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm text-slate-500">Italian Restaurant</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Event</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Upcoming</CardTitle>
                      <CardDescription>Events in the next 7 days</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    {/* Upcoming Event 1 */}
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <ListTodo className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">Pay Internet Bill</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm text-slate-500">May 22, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm text-slate-500">All day</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-200">
                        Remind Me
                      </Button>
                    </div>

                    {/* Upcoming Event 2 */}
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">Household Supplies</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm text-slate-500">May 25, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm text-slate-500">11:00 AM</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-200">
                        Remind Me
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="ghost" className="w-full text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                    View All Events
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 