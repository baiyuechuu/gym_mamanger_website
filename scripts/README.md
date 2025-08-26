# Gym Management System - Scripts

Clean, simple JavaScript modules for managing gym members and staff.

## File Structure

```
scripts/
├── app.js                      # Main application entry point
├── theme-manager.js            # Dark/light theme switching
├── core/
│   └── router.js              # Page routing and navigation
└── features/
    ├── auth-manager.js        # Authentication handling
    ├── data-manager.js        # Data operations (CRUD)
    ├── search-manager.js      # Search and filtering
    ├── pagination-manager.js  # Table pagination
    ├── modal-manager.js       # Add/edit member forms
    ├── overview-manager.js    # Main dashboard logic
    └── user-detail-manager.js # Member detail pages
```

## Key Features

### Data Synchronization
- **Complete Form Sync**: All "Add New Staff" form fields sync to table and detail views
- **Real-time Updates**: Changes appear immediately in all views
- **Data Persistence**: Automatic saving to server with error handling

### Member Information Display
- **Overview Table**: Shows booking number, name, contact info, status
- **Detail View**: Complete member profile with all information
- **Responsive Design**: Works on desktop and mobile devices

### Form Fields Supported
- Personal: Name, gender, age, birthday, address
- Contact: Email, mobile number
- Membership: Package type, start/end dates, payment info
- Status: Payment status with color-coded badges

## Module Responsibilities

### Core System
- **app.js**: Initialize application and coordinate all managers
- **router.js**: Handle navigation between overview and detail pages
- **theme-manager.js**: Toggle between light and dark themes

### Data Management
- **data-manager.js**: Load, save, add, remove member data
- **auth-manager.js**: Handle user authentication and permissions

### User Interface
- **overview-manager.js**: Manage member table, search, pagination
- **modal-manager.js**: Handle add member form and validation
- **user-detail-manager.js**: Display complete member information
- **search-manager.js**: Filter members by name, email, status
- **pagination-manager.js**: Navigate through member pages

## Data Flow

```
Add Member Form → Modal Manager → Data Manager → Server Save → Table Refresh
                                      ↓
Member Click → Router → User Detail Manager → Display All Info
```

## Simple Code Design

- **No Complex Logging**: Clean code without debug messages
- **Easy to Read**: Simple functions with clear names
- **Minimal Dependencies**: Each module does one thing well
- **Error Handling**: Basic validation and user feedback
- **Maintainable**: Easy to modify and extend

## Usage

1. **Add New Member**: Click "Add New Staff" → Fill form → Submit
2. **View Details**: Click any member row → See complete information
3. **Search Members**: Type in search box → Results filter automatically
4. **Navigate Pages**: Use pagination controls at bottom

All data entered in forms automatically appears in both the table and detail views.