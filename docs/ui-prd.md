# UI Product Requirements Document
## Focus Challenge Application

**Version**: 1.0  
**Date**: September 11, 2025  
**Author**: AI Assistant  
**Product Manager**: Jabir Abdurahiman  

---

## Table of Contents
1. [Introduction](#1-introduction)
   - [1.1 Purpose](#11-purpose)
   - [1.2 Scope](#12-scope)
   - [1.3 Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
   - [1.4 References](#14-references)
   - [1.5 Overview](#15-overview)
2. [User Interface Design Principles](#2-user-interface-design-principles)
   - [2.1 Design Philosophy](#21-design-philosophy)
   - [2.2 Color Scheme](#22-color-scheme)
   - [2.3 Typography](#23-typography)
   - [2.4 Iconography](#24-iconography)
3. [User Interface Components](#3-user-interface-components)
   - [3.1 Authentication Interface](#31-authentication-interface)
   - [3.2 Participant Dashboard](#32-participant-dashboard)
   - [3.3 Admin Dashboard](#33-admin-dashboard)
   - [3.4 Task Management Components](#34-task-management-components)
   - [3.5 Progress Tracking Components](#35-progress-tracking-components)
   - [3.6 Leaderboard Components](#36-leaderboard-components)
4. [User Interface Requirements](#4-user-interface-requirements)
   - [4.1 Visual Design Requirements](#41-visual-design-requirements)
   - [4.2 Interaction Design Requirements](#42-interaction-design-requirements)
   - [4.3 Responsive Design Requirements](#43-responsive-design-requirements)
   - [4.4 Accessibility Requirements](#44-accessibility-requirements)
5. [User Interface Specifications](#5-user-interface-specifications)
   - [5.1 Layout Specifications](#51-layout-specifications)
   - [5.2 Component Specifications](#52-component-specifications)
   - [5.3 Animation and Transition Specifications](#53-animation-and-transition-specifications)
6. [User Interface Testing Requirements](#6-user-interface-testing-requirements)
7. [Implementation Guidelines](#7-implementation-guidelines)

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the user interface requirements for the Focus Challenge Application. This document focuses specifically on the visual design, interaction patterns, and user experience elements of the application.

### 1.2 Scope
This UI PRD covers the following interface areas:
- Authentication screens (login, registration)
- Participant dashboard with task management
- Admin dashboard with challenge controls
- Task display and completion components
- Progress tracking visualization
- Leaderboard display
- Responsive design for mobile and desktop
- Accessibility features

### 1.3 Definitions, Acronyms, and Abbreviations
- **UI**: User Interface
- **UX**: User Experience
- **CSS**: Cascading Style Sheets
- **SVG**: Scalable Vector Graphics
- **PWA**: Progressive Web Application
- **RWD**: Responsive Web Design

### 1.4 References
- Project repository: https://github.com/your-username/focus-challenge
- Firebase Console: https://console.firebase.google.com/project/focus-challenge2
- TailwindCSS Documentation: https://tailwindcss.com/
- Lucide React Icons: https://lucide.dev/

### 1.5 Overview
This UI PRD provides detailed specifications for the user interface of the Focus Challenge Application. It defines the visual design language, component specifications, interaction patterns, and responsive behavior required for a world-class user experience.

## 2. User Interface Design Principles

### 2.1 Design Philosophy
The UI design follows these core principles:
1. **Islamic Design Values**: Respectful, modest, and culturally appropriate design
2. **Mobile-First Approach**: Optimized for mobile devices with responsive scaling
3. **Premium Feel**: High-quality visual design with sophisticated gradients and animations
4. **Intuitive Navigation**: Clear information hierarchy and easy-to-use interface
5. **Performance-Oriented**: Lightweight components with efficient rendering

### 2.2 Color Scheme
The application uses a custom Islamic color palette with the following primary colors:

| Color Name | HEX Value | Usage |
|------------|-----------|-------|
| Islamic Primary | #3B4F8A | Primary buttons, headers |
| Islamic Secondary | #5B6DC7 | Secondary elements, accents |
| Islamic Accent | #8B9DF2 | Highlights, interactive elements |
| Islamic Light | #E8EEFF | Backgrounds, cards |
| Islamic Gold | #FFD700 | Special elements, achievements |
| Islamic Dark | #2A3B7A | Text, icons |

Additional premium gradients:
- Blue gradient: from-blue-500 to-indigo-600
- Purple gradient: from-purple-500 to-indigo-600
- Amber gradient: from-amber-500 to-orange-600

### 2.3 Typography
The application uses the following font stack:
- **Primary Font**: 'Inter' for UI elements (system-ui, Avenir, Helvetica, Arial, sans-serif)
- **Arabic Font**: 'Amiri' for Arabic text (fallback to system Arabic fonts)

Font weights used:
- 300: Light text
- 400: Regular text
- 500: Medium text
- 600: Semi-bold headings
- 700: Bold headings
- 800-900: Extra bold titles

### 2.4 Iconography
The application uses Lucide React icons consistently throughout the interface. Icons are used to:
- Represent actions (edit, delete, save)
- Indicate status (completed, locked, active)
- Categorize content (worship, knowledge, social)
- Navigation elements (home, profile, leaderboard)

## 3. User Interface Components

### 3.1 Authentication Interface

#### Login Screen
The login screen includes:
- Islamic-themed background pattern
- Centered card with gradient header
- Moon icon with gold sparkle animation
- App title with Arabic greeting
- Google sign-in button with Islamic blue gradient
- Loading states with animated spinner

#### Loading States
- Animated logo with pulse effect
- Loading spinner with gradient animation
- Skeleton screens for content loading

### 3.2 Participant Dashboard

#### Header Component
- Fixed position at top of screen
- Gradient background with subtle shadow
- Tab icons with color-coded active states
- Points display with star icon and amber color
- Current day indicator with blue background
- Sign-out button with hover effects

#### Navigation Footer
- Fixed position at bottom of screen
- Rounded container with glassmorphism effect
- Three main tabs: Tasks, Leaderboard, Profile
- Active tab with gradient background and glow effect
- Tab icons with smooth transitions
- Label text that changes color based on active state

#### Task Cards
Ultra-compact mobile-first design with:
- Rounded corners (2xl)
- Gradient backgrounds based on completion status
- Left-aligned day indicator with sequence number
- Task title with truncate behavior
- Points display with sophisticated purple treatment
- Lock icon for locked tasks
- Celebration animation for completed tasks
- Touch-friendly sizing (minimum 44px touch targets)

#### Task Detail Modal
Premium modal with:
- Backdrop with blur effect
- Rounded corners (3xl)
- Header with book icon and gradient background
- Detailed task information
- Tips section with bullet points and gradient indicators
- Close button with subtle animation

#### Progress Tracking
Components include:
- Overall progress card with target icon
- Daily progress display with progress bar
- Achievement cards for points, completed tasks, and overall progress
- Percentage completion with gradient bar

### 3.3 Admin Dashboard

#### Header Component
- Gradient background matching Islamic color scheme
- User greeting with admin title
- Challenge status indicator with play/pause icons
- Sign-out functionality

#### Navigation Tabs
- Overview, Settings, and Leaderboard tabs
- Active tab highlighting with Islamic primary color
- Icons for each tab (Settings, Trophy)
- Smooth hover transitions

#### Statistics Cards
- Grid layout with 4 cards on desktop, stacked on mobile
- Icons for each metric (Users, Trending, Calendar, Trophy)
- Large numerical values with Islamic dark text
- Descriptive labels with Islamic primary text

#### Participants List
- Table-based display with sorting capabilities
- Participant information with avatar placeholders
- Progress indicators with visual bars
- Action buttons with icons (Reset, Delete, View)
- Loading states with skeleton screens

#### Challenge Controls
- Start/Stop challenge buttons with appropriate icons
- Pause/Resume functionality
- Countdown timer for current day
- Status indicators with color coding

### 3.4 Task Management Components

#### Task Editor Modal
- Full-screen modal with backdrop
- Form validation with error display
- Preview section showing task appearance
- Category selection with emoji indicators
- Difficulty level selection
- Tips management with add/remove functionality
- Save/Delete actions with loading states

#### Task Filter and Search
- Search input with clear functionality
- Category filter dropdown
- Sorting options dropdown
- Active filter display with clear option
- Results counter

#### Bulk Task Management
- Import functionality with file upload
- Task reordering with drag handles
- Batch actions for multiple tasks
- Confirmation dialogs for destructive actions

### 3.5 Progress Tracking Components

#### Individual Progress Display
- User profile section with name and email
- Rank display with badge system
- Points total with star icon
- Progress visualization with gradient bars
- Task completion statistics

#### Progress Charts
- Recharts library for data visualization
- Responsive charts that adapt to screen size
- Color-coded data series matching Islamic palette
- Interactive tooltips with detailed information

### 3.6 Leaderboard Components

#### Leaderboard List
- Gradient backgrounds for top 3 positions
- Rank indicators with appropriate icons (Crown, Medal, Award)
- User information with truncate behavior
- Points display with flame icon
- Progress bars with gradient fills
- Completion percentage indicators

#### Empty States
- Trophy icon with gradient background
- "No Participants Yet" message
- Encouraging text to be the first participant

#### Motivational Footer
- Gradient background with Islamic colors
- Inspirational quote from Quran (29:6)
- Star icons for decoration
- Subtle animations for engagement

## 4. User Interface Requirements

### 4.1 Visual Design Requirements

#### Color Usage
- Primary Islamic color palette must be used consistently
- Gradient backgrounds for cards and buttons
- Appropriate contrast ratios for accessibility
- Color-coded status indicators (success, warning, error)
- Hover states with subtle color shifts

#### Typography Requirements
- Consistent font usage throughout the application
- Appropriate font sizing for different screen sizes
- Clear hierarchy with heading levels
- Arabic text with proper font support
- Text truncation for long content

#### Spacing and Layout
- Consistent padding and margin system
- Grid-based layout with appropriate gutters
- Mobile-first spacing with responsive adjustments
- Touch-friendly sizing for interactive elements
- Visual balance between components

### 4.2 Interaction Design Requirements

#### Navigation Patterns
- Tab-based navigation for main sections
- Breadcrumb navigation for deeper sections
- Clear back navigation where appropriate
- Persistent navigation elements
- Smooth transitions between views

#### Feedback Mechanisms
- Loading states for all asynchronous operations
- Success indicators for completed actions
- Error messages with clear guidance
- Confirmation dialogs for destructive actions
- Visual feedback for user interactions

#### Gestures and Touch
- Tap targets minimum 44px in size
- Swipe gestures where appropriate
- Long press actions for additional options
- Touch ripple effects for feedback
- Scroll-friendly layouts

### 4.3 Responsive Design Requirements

#### Breakpoints
- Mobile: 0px - 768px
- Tablet: 769px - 1024px
- Desktop: 1025px and above

#### Layout Adaptations
- Single column layout on mobile
- Multi-column grids on tablet and desktop
- Adjustable component sizes based on screen width
- Hidden/condensed elements on smaller screens
- Appropriate font sizing for each breakpoint

#### Touch Optimization
- Larger touch targets on mobile
- Simplified navigation on small screens
- Vertical scrolling preference
- Appropriate spacing for thumb-friendly interactions
- Mobile-specific components where needed

### 4.4 Accessibility Requirements

#### Visual Accessibility
- Minimum contrast ratios (4.5:1 for normal text)
- Sufficient color contrast for interactive elements
- Clear focus states for keyboard navigation
- Appropriate font sizing with scaling support
- Alternative text for all informative images

#### Motor Accessibility
- Keyboard navigable interface
- Sufficient time for interactions
- Reduced motion options
- Large touch targets
- Consistent navigation patterns

#### Cognitive Accessibility
- Clear labeling of form elements
- Simple, consistent navigation
- Predictable interaction patterns
- Clear error messages and instructions
- Logical content organization

## 5. User Interface Specifications

### 5.1 Layout Specifications

#### Grid System
- 12-column grid system for desktop layouts
- Flexible column widths based on content
- Consistent gutter spacing (24px desktop, 16px mobile)
- Responsive column collapsing on smaller screens

#### Component Dimensions
- Header height: 72px (desktop), 60px (mobile)
- Footer height: 80px (mobile)
- Card corner radius: 16px
- Button corner radius: 8px
- Modal corner radius: 24px

#### Spacing System
- XS: 4px
- S: 8px
- M: 16px
- L: 24px
- XL: 32px
- XXL: 48px

### 5.2 Component Specifications

#### Buttons
- Primary buttons: Islamic primary color with white text
- Secondary buttons: Light background with Islamic primary text
- Icon buttons: Circular with appropriate sizing
- Loading states with spinners
- Disabled states with reduced opacity
- Hover and active states with visual feedback

#### Cards
- Glassmorphism effect with backdrop blur
- Subtle shadows for depth
- Gradient backgrounds based on content type
- Consistent padding and spacing
- Rounded corners with appropriate radius

#### Forms
- Consistent input styling
- Clear labels and placeholders
- Validation error display
- Appropriate input sizing
- Focus states with Islamic primary color

#### Modals
- Centered positioning
- Backdrop overlay with blur effect
- Smooth entrance and exit animations
- Close functionality in multiple ways
- Appropriate sizing for content

### 5.3 Animation and Transition Specifications

#### Micro-interactions
- Button hover effects with subtle scale changes
- Card hover states with elevation changes
- Form field focus animations
- Loading spinner animations
- Toggle switch animations

#### Page Transitions
- Fade transitions between routes
- Slide animations for modals
- Staggered animations for lists
- Smooth scrolling behavior
- Entrance animations for new content

#### Loading Animations
- Skeleton screens for content loading
- Pulse animations for indeterminate loading
- Progress bars for known duration actions
- Shimmer effects for data fetching
- Animated placeholders

## 6. User Interface Testing Requirements

### Visual Testing
- Cross-browser compatibility testing
- Visual regression testing for component changes
- Color contrast verification
- Responsive layout verification
- Typography rendering consistency

### Interaction Testing
- Touch interaction testing on mobile devices
- Keyboard navigation testing
- Screen reader compatibility
- Focus management verification
- Gesture recognition testing

### Performance Testing
- Load time measurements for UI components
- Animation performance on different devices
- Memory usage during UI interactions
- Rendering performance for complex views
- Network impact of UI assets

### Usability Testing
- User task completion rates
- Time to complete common actions
- Error rate during UI interactions
- User satisfaction surveys
- Accessibility audit results

## 7. Implementation Guidelines

### Technology Stack
- React 18 with TypeScript
- TailwindCSS for styling
- Lucide React for icons
- Recharts for data visualization
- CSS animations and transitions

### Component Structure
- Reusable component library
- Consistent naming conventions
- Proper component composition
- State management best practices
- Performance optimization techniques

### Design System
- Component documentation
- Style guide with color and typography specifications
- Design token system
- Component variant system
- Accessibility compliance checklist

### Development Process
- Component-driven development approach
- Design-to-code workflow
- Regular design reviews
- Accessibility audits
- Performance monitoring

---

**Document Approval**

| Name | Role | Signature | Date |
|------|------|-----------|------|
| Jabir Abdurahiman | Product Manager | | |
| Development Team | Engineering | | |

**Change History**

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | September 11, 2025 | AI Assistant | Initial version |