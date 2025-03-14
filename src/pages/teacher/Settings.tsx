
import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const Settings: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <TeacherLayout pageTitle="Settings">
      <div className="mb-8 animate-fade-in">
        {!isMobile && <h1 className="text-3xl font-bold mb-6">Settings</h1>}
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className={`mb-6 ${isMobile ? 'w-full' : ''}`}>
            <TabsTrigger value="profile" className={isMobile ? 'flex-1' : ''}>Profile</TabsTrigger>
            <TabsTrigger value="account" className={isMobile ? 'flex-1' : ''}>Account</TabsTrigger>
            <TabsTrigger value="preferences" className={isMobile ? 'flex-1' : ''}>Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information visible to students.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Your last name" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio" 
                    className="w-full min-h-[120px] p-2 border rounded-md resize-y" 
                    placeholder="Tell students about yourself..."
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account details and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Change Password</Label>
                  <Input id="password" type="password" placeholder="New password" />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Update Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Preferences</CardTitle>
                <CardDescription>
                  Customize your teaching experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-4 text-muted-foreground">
                  Preferences settings coming soon!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TeacherLayout>
  );
};

export default Settings;
