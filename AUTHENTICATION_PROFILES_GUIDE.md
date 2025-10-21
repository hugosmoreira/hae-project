# 🔐 Authentication & User Profiles - Complete Setup Guide

## ✅ What's Already Working

Your app already has:
- ✅ Auth signup/login page (`src/pages/Auth.tsx`)
- ✅ User metadata being passed on signup (username, role, region)
- ✅ Profiles table structure in Supabase
- ✅ Profile data being displayed in messages

## 🚀 What We Need to Add

### **Automatic Profile Creation on Signup**
Currently, when a user signs up, their profile row might not be created automatically. We need to add a database trigger to handle this.

---

## 📋 Step-by-Step Setup

### **Step 1: Run the SQL Setup**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy the contents** of `PROFILE_AUTO_CREATE_SETUP.sql`
3. **Paste and Run** the SQL
4. **Verify Success** - should see "Success" message

**What This Does:**
- ✅ Creates `handle_new_user()` function
- ✅ Creates trigger `on_auth_user_created`
- ✅ Auto-creates profile when user signs up
- ✅ Sets up RLS policies
- ✅ Creates indexes for performance
- ✅ Enables Realtime for profiles

---

### **Step 2: Backfill Existing Users (If Any)**

If you already have users in `auth.users` without profiles:

```sql
-- Run this to create profiles for existing users
INSERT INTO public.profiles (id, username, role, region)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
  COALESCE(au.raw_user_meta_data->>'role', 'User') as role,
  COALESCE(au.raw_user_meta_data->>'region', 'Unknown') as region
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

---

### **Step 3: Test Profile Creation**

1. **Go to your app** → `/auth`
2. **Sign up a new user** with:
   - Username: "Test User"
   - Email: "test@example.com"
   - Password: "test123"
   - Role: "Inspector"
   - Region: "Oregon"
3. **Go to Supabase** → Table Editor → `profiles`
4. **Verify** the new profile row was created automatically

---

### **Step 4: Test Profile Display**

1. **Login with the new user**
2. **Go to Chat** → Send a message
3. **Verify** the message shows:
   - ✅ Username ("Test User")
   - ✅ Role badge ("Inspector")
   - ✅ Region badge ("Oregon")
   - ✅ Avatar (initials: "TU")

---

## 🎨 Profile Display Features

### **Already Implemented:**

#### **In Messages (MessageItem.tsx)**
```typescript
// Username
<span>{message.author?.username || 'Unknown User'}</span>

// Role Badge
<Badge variant={getRoleBadgeVariant(message.author?.role || '')}>
  {message.author?.role || 'User'}
</Badge>

// Region Badge
<Badge variant="outline">
  {message.author?.region || 'Unknown'}
</Badge>

// Avatar with Initials
<Avatar>
  <AvatarFallback>{getInitials(message.author?.username || 'U')}</AvatarFallback>
</Avatar>
```

---

## 🔒 Authentication Guard

### **Current Implementation:**

The app already has authentication checks in place:

1. **Layout.tsx** - Checks for session on app load
2. **Index.tsx** - Redirects to discussions if logged in
3. **Auth.tsx** - Redirects to home if already logged in

### **Pages That Require Auth:**
- ✅ `/chat` - Chat interface
- ✅ `/discussions` - Discussions board
- ✅ `/profile` - User profile settings
- ✅ `/polls` - Community polls

---

## 📊 Database Schema

### **Profiles Table Structure:**

```sql
profiles (
  id UUID PRIMARY KEY → auth.users(id) ON DELETE CASCADE,
  username TEXT,
  role TEXT,
  region TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### **RLS Policies:**

```sql
-- Everyone can read all profiles (for displaying authors)
"Users can read all profiles" - SELECT USING (true)

-- Users can update their own profile
"Users can update own profile" - UPDATE USING (auth.uid() = id)

-- Users can insert their own profile (for manual creation)
"Users can insert own profile" - INSERT WITH CHECK (auth.uid() = id)
```

---

## 🧪 Testing Checklist

### **Profile Auto-Creation:**
- [ ] Sign up new user
- [ ] Profile row created in `profiles` table
- [ ] Username matches signup form
- [ ] Role matches signup form
- [ ] Region matches signup form

### **Profile Display:**
- [ ] Messages show correct username
- [ ] Role badge displays correctly
- [ ] Region badge displays correctly
- [ ] Avatar shows user initials
- [ ] Multiple messages from same user grouped

### **Authentication Guard:**
- [ ] Can't access chat without login
- [ ] Redirected to login if not authenticated
- [ ] Can access chat after login
- [ ] Profile data loads correctly

---

## 🐛 Troubleshooting

### Issue: Profile not created on signup
**Solution:**
1. Check if trigger exists:
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```
2. Check if function exists:
```sql
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
```
3. Re-run the setup SQL if missing

### Issue: Username shows as email
**Solution:**
- This is normal if username wasn't provided
- The trigger defaults to email prefix
- Update the profile manually or on next signup

### Issue: Messages don't show author info
**Solution:**
1. Check the message has `user_id`
2. Check profile exists for that `user_id`
3. Check the foreign key constraint:
```sql
SELECT * FROM information_schema.table_constraints 
WHERE constraint_name LIKE '%messages_user_id_fkey%';
```

---

## 🎯 What You Get

### **After Setup:**

1. **Automatic Profile Creation**
   - ✅ Profile created when user signs up
   - ✅ No manual intervention needed
   - ✅ Username, role, region auto-populated

2. **Profile Display in Messages**
   - ✅ Username shown
   - ✅ Role badge (color-coded)
   - ✅ Region badge
   - ✅ Avatar with initials

3. **Authentication Guard**
   - ✅ Protected routes
   - ✅ Redirect to login if not authenticated
   - ✅ Session persistence

4. **Profile Updates**
   - ✅ Users can update their profile
   - ✅ Changes reflected in all messages
   - ✅ Real-time updates (if Realtime enabled)

---

## 📝 Next Steps

After running the SQL:

1. ✅ **Test signup** with a new user
2. ✅ **Verify profile** created in Supabase
3. ✅ **Send a message** and check display
4. ✅ **Update profile** in `/profile` page
5. ✅ **Verify changes** reflected in messages

---

## 🎉 Success Criteria

All of the following should be true:

- ✅ New users get profiles automatically
- ✅ Profiles have username, role, region
- ✅ Messages display author information
- ✅ Avatars show user initials
- ✅ Role badges are color-coded
- ✅ Can't access chat without login
- ✅ Profile updates work
- ✅ No console errors

**Your authentication and profiles system is now complete!** 🚀




