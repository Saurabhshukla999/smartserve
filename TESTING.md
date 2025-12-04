# Auth System Testing Checklist

## Unit Tests (Recommended)
- [ ] JWT token generation and verification
- [ ] Password hashing and comparison
- [ ] User validation on signup/login

## Integration Tests
- [ ] Complete signup flow
- [ ] Complete login flow
- [ ] Token persistence and retrieval
- [ ] Auth store state updates

## Manual Testing Scenarios

### Scenario 1: New User Registration
\`\`\`
1. Go to /signup
2. Select "Service Seeker" role
3. Enter: name="Alice Johnson", email="alice@example.com", password="Test123!"
4. Enter phone: "+1 (555) 123-4567"
5. Click "Create Account"
6. Expected: Redirect to /services, toast shows "Account created successfully!"
7. Verify: localStorage contains authToken
\`\`\`

### Scenario 2: Provider Registration
\`\`\`
1. Go to /signup
2. Select "Service Provider" role
3. Enter: name="Bob Smith", email="bob@example.com", password="Test456!"
4. Enter phone: "+1 (555) 987-6543"
5. Click "Create Account"
6. Expected: Redirect to /provider/dashboard
7. Verify: Can access provider-only routes
\`\`\`

### Scenario 3: Login Flow
\`\`\`
1. Go to /login
2. Enter: email="alice@example.com", password="Test123!"
3. Click "Sign In"
4. Expected: Redirect to /services, toast shows "Login successful!"
5. Verify: Navbar shows "Profile" and "Logout" options
\`\`\`

### Scenario 4: Failed Login
\`\`\`
1. Go to /login
2. Enter: email="wrong@example.com", password="WrongPassword"
3. Click "Sign In"
4. Expected: Error message "Invalid credentials"
5. Verify: Remain on /login page
\`\`\`

### Scenario 5: Protected Route Access
\`\`\`
1. Logout or clear localStorage
2. Try accessing /profile directly
3. Expected: Redirect to /login
4. Try accessing /bookings
5. Expected: Redirect to /login
\`\`\`

### Scenario 6: Role-Based Protection
\`\`\`
1. Login as user (alice@example.com)
2. Try accessing /provider/dashboard
3. Expected: Redirect to /login
4. Logout and login as provider (bob@example.com)
5. Try accessing /provider/dashboard
6. Expected: Dashboard loads successfully
\`\`\`

### Scenario 7: Session Persistence
\`\`\`
1. Login successfully
2. Refresh page (F5)
3. Expected: Stay logged in, no redirect to login
4. Close browser tab and reopen app
5. Expected: Still logged in
\`\`\`

### Scenario 8: Logout Flow
\`\`\`
1. Login successfully
2. Click "Logout" in navbar
3. Expected: Redirect to home, toast shows success
4. Verify: localStorage authToken is cleared
5. Try accessing /profile
6. Expected: Redirect to /login
\`\`\`

## Error Cases to Test
- [ ] Signup with existing email
- [ ] Login with non-existent email
- [ ] Password mismatch on signup
- [ ] Missing required fields
- [ ] Invalid email format
- [ ] Password too short
- [ ] Network error during request
- [ ] Expired token access (wait 7 days or manually expire)
