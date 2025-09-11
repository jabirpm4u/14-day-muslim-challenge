# Focus Challenge - Context7 Documentation

## Overview

The Focus Challenge is a web application designed to help Muslims strengthen their Islamic identity through a structured challenge program. This documentation provides technical specifications for integration with Context7 MCP server.

## Library Information

- **Library ID**: `/challenge/muslim-challenge`
- **Version**: 1.0.0
- **Category**: Educational/Spiritual Development
- **Framework**: React 18 + Firebase
- **Language**: TypeScript

## Core Modules

### 1. Authentication System (`/src/firebase/auth.ts`)

#### Interfaces
```typescript
interface UserRole {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'participant';
  joinedAt: any;
  progress: Record<string, boolean>;
  points: Record<string, number>;
  totalPoints: number;
  rank: number;
  updatedAt?: any;
}
```

#### API Functions

##### `signInWithGoogle()`
- **Description**: Authenticates user with Google OAuth and creates user profile if needed
- **Returns**: `Promise<UserRole | null>`
- **Usage**: 
  ```typescript
  const userRole = await signInWithGoogle();
  ```

##### `signOutUser()`
- **Description**: Signs out the current user
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await signOutUser();
  ```

##### `getCurrentUserRole()`
- **Description**: Retrieves the current user's role data
- **Returns**: `Promise<UserRole | null>`
- **Usage**:
  ```typescript
  const role = await getCurrentUserRole();
  ```

### 2. Firestore Data Layer (`/src/firebase/firestore.ts`)

#### Data Models

##### `Task`
```typescript
interface Task {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
  category: 'trial' | 'worship' | 'social' | 'knowledge' | 'identity' | 'final';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  tips?: string[];
}
```

##### `ChallengeSettings`
```typescript
interface ChallengeSettings {
  id: string;
  isActive: boolean;
  isPaused: boolean;
  startDate: any;
  endDate?: any;
  scheduledStartDate?: any;
  scheduledEndDate?: any;
  currentDay: number;
  dayDuration: number;
  trialEnabled: boolean;
  challengeDays: ChallengeDay[];
  pausedAt?: any;
  resumedAt?: any;
  createdAt: any;
  updatedAt: any;
}
```

#### Challenge Management Functions

##### `startChallenge()`
- **Description**: Starts the challenge with automatic date generation
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await startChallenge();
  ```

##### `stopChallenge()`
- **Description**: Stops the active challenge
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await stopChallenge();
  ```

##### `pauseChallenge()`
- **Description**: Pauses the active challenge
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await pauseChallenge();
  ```

##### `resumeChallenge()`
- **Description**: Resumes a paused challenge with recalculated dates
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await resumeChallenge();
  ```

##### `advanceToNextDay(currentDay: number)`
- **Description**: Advances the challenge to the next day
- **Parameters**: 
  - `currentDay`: Current day number
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await advanceToNextDay(3);
  ```

##### `getChallengeSettings()`
- **Description**: Retrieves current challenge settings
- **Returns**: `Promise<ChallengeSettings | null>`
- **Usage**:
  ```typescript
  const settings = await getChallengeSettings();
  ```

##### `updateChallengeSettings(settings: Partial<ChallengeSettings>)`
- **Description**: Updates challenge settings
- **Parameters**: 
  - `settings`: Partial challenge settings to update
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await updateChallengeSettings({ dayDuration: 24 });
  ```

#### Task Management Functions

##### `getAllTasks(autoInitialize: boolean = false)`
- **Description**: Retrieves all tasks
- **Parameters**: 
  - `autoInitialize`: Whether to initialize default tasks if none exist
- **Returns**: `Promise<Task[]>`
- **Usage**:
  ```typescript
  const tasks = await getAllTasks(true);
  ```

##### `getAvailableTasks(challengeSettings?: ChallengeSettings | null)`
- **Description**: Retrieves tasks available based on challenge state
- **Parameters**: 
  - `challengeSettings`: Current challenge settings
- **Returns**: `Promise<Task[]>`
- **Usage**:
  ```typescript
  const availableTasks = await getAvailableTasks(settings);
  ```

##### `createOrUpdateTask(task: Omit<Task, 'id'> & { id?: string })`
- **Description**: Creates or updates a task
- **Parameters**: 
  - `task`: Task data to create or update
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await createOrUpdateTask({
    dayNumber: 1,
    title: "Greet Fellow Muslims",
    description: "Greet at least 10 Muslims...",
    points: 20,
    category: 'social',
    difficulty: 'easy',
    estimatedTime: 'Throughout the day'
  });
  ```

##### `deleteTask(taskId: string)`
- **Description**: Deletes a task
- **Parameters**: 
  - `taskId`: ID of the task to delete
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await deleteTask("task-id-123");
  ```

#### User Progress Functions

##### `updateUserProgress(userId: string, day: string, completed: boolean, points: number = 0)`
- **Description**: Updates user progress for a specific day
- **Parameters**: 
  - `userId`: User ID
  - `day`: Day identifier
  - `completed`: Whether the task is completed
  - `points`: Points earned
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await updateUserProgress("user-id-123", "day1", true, 20);
  ```

##### `resetParticipantProgress(userId: string)`
- **Description**: Resets a participant's progress
- **Parameters**: 
  - `userId`: User ID
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await resetParticipantProgress("user-id-123");
  ```

##### `deleteParticipant(userId: string)`
- **Description**: Deletes a participant permanently
- **Parameters**: 
  - `userId`: User ID
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await deleteParticipant("user-id-123");
  ```

#### Leaderboard Functions

##### `getLeaderboard()`
- **Description**: Retrieves leaderboard entries
- **Returns**: `Promise<LeaderboardEntry[]>`
- **Usage**:
  ```typescript
  const leaderboard = await getLeaderboard();
  ```

##### `updateLeaderboard()`
- **Description**: Updates leaderboard rankings
- **Returns**: `Promise<void>`
- **Usage**:
  ```typescript
  await updateLeaderboard();
  ```

### 3. Real-time Subscriptions

#### `subscribeToChallengeSettings(callback: (settings: ChallengeSettings | null) => void)`
- **Description**: Subscribes to challenge settings changes
- **Parameters**: 
  - `callback`: Function to call when settings change
- **Returns**: Unsubscribe function
- **Usage**:
  ```typescript
  const unsubscribe = subscribeToChallengeSettings((settings) => {
    console.log("Settings updated:", settings);
  });
  ```

#### `subscribeToParticipants(callback: (participants: UserProgress[]) => void)`
- **Description**: Subscribes to participants data changes
- **Parameters**: 
  - `callback`: Function to call when participants data changes
- **Returns**: Unsubscribe function
- **Usage**:
  ```typescript
  const unsubscribe = subscribeToParticipants((participants) => {
    console.log("Participants updated:", participants);
  });
  ```

#### `subscribeToLeaderboard(callback: (leaderboard: LeaderboardEntry[]) => void)`
- **Description**: Subscribes to leaderboard changes
- **Parameters**: 
  - `callback`: Function to call when leaderboard changes
- **Returns**: Unsubscribe function
- **Usage**:
  ```typescript
  const unsubscribe = subscribeToLeaderboard((leaderboard) => {
    console.log("Leaderboard updated:", leaderboard);
  });
  ```

## Integration Guidelines

### Authentication Flow
1. Use `signInWithGoogle()` for user authentication
2. Check user role with `getCurrentUserRole()`
3. Redirect based on role ('admin' or 'participant')

### Challenge Lifecycle
1. Initialize with `getChallengeSettings()`
2. Start with `startChallenge()` or schedule with `setScheduledDates()`
3. Monitor with `subscribeToChallengeSettings()`
4. Advance days with `advanceToNextDay()`
5. End with `stopChallenge()`

### Task Management
1. Retrieve with `getAllTasks()` or `getAvailableTasks()`
2. Create/update with `createOrUpdateTask()`
3. Delete with `deleteTask()`
4. Monitor changes with `subscribeToTasks()`

### Progress Tracking
1. Update with `updateUserProgress()`
2. Reset with `resetParticipantProgress()`
3. Delete with `deleteParticipant()`
4. View with `getParticipants()` or `subscribeToParticipants()`

### Leaderboard
1. Retrieve with `getLeaderboard()`
2. Subscribe with `subscribeToLeaderboard()`
3. Update automatically with `updateLeaderboard()`

## Security Considerations

- Firebase Authentication handles user authentication
- Role-based access control implemented in Firestore rules
- Admin functions should be protected with proper authorization checks
- Data validation implemented on both client and server sides

## Performance Optimization

- Lazy loading for admin and participant dashboards
- Batch operations for Firestore updates
- Debounced leaderboard updates
- Efficient querying with Firestore indexes
- Real-time listeners for data synchronization

## Error Handling

All functions include proper error handling with try/catch blocks. Functions throw descriptive errors that should be handled appropriately in the application code.

## Dependencies

- firebase: ^10.13.2
- react: ^18.3.1
- react-router-dom: ^6.26.2
- lucide-react: ^0.445.0
- recharts: ^2.12.7
- tailwindcss: ^3.4.13

## Deployment

- Firebase Hosting for web deployment
- GitHub Actions for CI/CD
- Automatic deployment on push to main branch