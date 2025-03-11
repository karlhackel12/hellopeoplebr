
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailData {
  email: string;
  invitation_code: string;
  teacher_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, invitation_code, teacher_name }: InvitationEmailData = await req.json();

    console.log(`Sending invitation email to ${email} with code ${invitation_code}`);

    // Create the invitation URL
    const baseUrl = Deno.env.get("APP_URL") || "http://localhost:5173";
    const invitationUrl = `${baseUrl}/invitation?code=${invitation_code}`;

    const emailResponse = await resend.emails.send({
      from: "HelloPeople <onboarding@resend.dev>",
      to: [email],
      subject: "You've been invited to join HelloPeople!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px;">
            <h1 style="color: #3b82f6; margin-bottom: 16px;">You're invited to HelloPeople!</h1>
            <p style="margin-bottom: 12px;">Hello,</p>
            <p style="margin-bottom: 12px;">${teacher_name} has invited you to join HelloPeople, the language learning platform that helps you achieve fluency faster.</p>
            <p style="margin-bottom: 20px;">Use the invitation code below or click the button to get started:</p>
            <div style="background-color: #e2e8f0; padding: 12px; border-radius: 4px; text-align: center; margin-bottom: 20px; font-family: monospace; font-size: 24px; letter-spacing: 2px;">
              ${invitation_code}
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${invitationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px;">If you weren't expecting this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
