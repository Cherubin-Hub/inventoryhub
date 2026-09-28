"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { addMemberSchema, type AddMemberInput } from "../schemas";
import { addTeamMember } from "../actions";

export function AddMemberForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { name: "", email: "", password: "", role: UserRole.STAFF },
  });

  async function handleSubmit(values: AddMemberInput) {
    setServerError(null);
    setIsLoading(true);

    const result = await addTeamMember(values);

    if (result?.error) {
      setServerError(result.error);
    } else {
      form.reset(); // Clear the form on success
    }
    
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Add New Member</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {serverError && <div className="text-sm text-destructive">{serverError}</div>}

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem><FormLabel>Temp Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  {/* Standard HTML select with Tailwind styling for simplicity */}
                  <select 
                    {...field} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value={UserRole.STAFF}>Staff</option>
                    <option value={UserRole.MANAGER}>Manager</option>
                    <option value={UserRole.OWNER}>Owner</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Member"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
