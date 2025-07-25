import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { EmailService } from "./services/email";
import { insertWaitlistSubscriberSchema, insertOmnistockLeadSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const emailService = new EmailService();

  // Waitlist subscription endpoint
  app.post("/api/waitlist/subscribe", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertWaitlistSubscriberSchema.parse(req.body);
      const { email } = validatedData;

      // Check if subscriber already exists
      const existingSubscriber = await storage.getWaitlistSubscriberByEmail(email);
      if (existingSubscriber && existingSubscriber.isActive) {
        return res.status(200).json({
          success: true,
          message: "You're already on our waitlist!",
          subscriber: existingSubscriber
        });
      }

      // Store in database
      let subscriber;
      if (existingSubscriber) {
        // Reactivate existing subscriber
        subscriber = await storage.updateWaitlistSubscriber(email, {
          isActive: true
        });
      } else {
        // Create new subscriber
        subscriber = await storage.createWaitlistSubscriber({
          email
        });
      }

      // Send welcome email autoresponder
      try {
        await emailService.sendWelcomeEmail(email);
        console.log(`Welcome email sent to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send welcome email to ${email}:`, emailError);
        // Don't block the subscription if email fails
      }

      res.status(201).json({
        success: true,
        message: "Successfully joined the waitlist!",
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          subscribedAt: subscriber.subscribedAt
        }
      });

    } catch (error: any) {
      console.error("Waitlist subscription error:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
          errors: error.errors
        });
      }

      // Handle specific Mailchimp errors
      if (error.message.includes('looks fake or invalid')) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid, real email address"
        });
      }

      if (error.message.includes('Member Exists') || error.message.includes('already a list member')) {
        return res.status(200).json({
          success: true,
          message: "You're already subscribed to our list!"
        });
      }

      if (error.message.includes('Mailchimp')) {
        return res.status(500).json({
          success: false,
          message: "Email subscription service is temporarily unavailable. Please try again later."
        });
      }

      res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again."
      });
    }
  });

  // Get waitlist status endpoint
  app.get("/api/waitlist/status/:email", async (req, res) => {
    try {
      const { email } = req.params;

      if (!email || !z.string().email().safeParse(email).success) {
        return res.status(400).json({
          success: false,
          message: "Invalid email address"
        });
      }

      const subscriber = await storage.getWaitlistSubscriberByEmail(email);

      if (!subscriber || !subscriber.isActive) {
        return res.status(404).json({
          success: false,
          message: "Email not found on waitlist"
        });
      }

      res.json({
        success: true,
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          subscribedAt: subscriber.subscribedAt
        }
      });

    } catch (error) {
      console.error("Waitlist status check error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Admin endpoint to get all waitlist subscribers
  app.get("/api/waitlist/subscribers", async (req, res) => {
    try {
      const subscribers = await storage.getAllWaitlistSubscribers();

      res.json({
        success: true,
        count: subscribers.length,
        subscribers: subscribers.map(sub => ({
          id: sub.id,
          email: sub.email,
          subscribedAt: sub.subscribedAt
        }))
      });

    } catch (error) {
      console.error("Get subscribers error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Database status endpoint
  app.get("/api/waitlist/status", async (req, res) => {
    try {
      const subscribers = await storage.getAllWaitlistSubscribers();
      
      res.json({
        success: true,
        total: subscribers.length,
        active: subscribers.filter(s => s.isActive).length
      });

    } catch (error) {
      console.error("Database status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get waitlist status"
      });
    }
  });

  // Omnostock leads endpoint
  app.post("/api/omnostock-leads", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertOmnistockLeadSchema.parse(req.body);
      
      // Store in database
      const lead = await storage.createOmnistockLead(validatedData);

      res.status(201).json({
        success: true,
        message: "Lead submitted successfully!",
        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          createdAt: lead.createdAt
        }
      });

    } catch (error: any) {
      console.error("Omnostock lead submission error:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid form data",
          errors: error.errors
        });
      }

      res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again."
      });
    }
  });

  // Admin endpoint to get all Omnostock leads
  app.get("/api/admin/leads", async (req, res) => {
    try {
      const leads = await storage.getAllOmnistockLeads();

      res.json({
        success: true,
        leads: leads,
        total: leads.length
      });

    } catch (error) {
      console.error("Admin leads fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch leads. Please try again."
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}