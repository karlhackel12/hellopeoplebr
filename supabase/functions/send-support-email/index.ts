
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: SupportEmailData = await req.json();

    console.log(`Sending support email from ${name} (${email}) with subject: ${subject}`);

    // 1. Send the support email to the HelloPeople team
    const supportEmailResponse = await resend.emails.send({
      from: "HelloPeople Suporte <suporte@hellopeoplebr.com>",
      to: ["ajuda@hellopeoplebr.com"],
      subject: `Suporte: ${subject}`,
      reply_to: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E88E5;">Nova mensagem de suporte</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Assunto:</strong> ${subject}</p>
          <div style="margin-top: 24px;">
            <h3 style="color: #555;">Mensagem:</h3>
            <div style="background-color: #f5f5f5; padding: 16px; border-radius: 4px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
      `,
    });

    if (supportEmailResponse.error) {
      console.error("Error sending support team email:", supportEmailResponse.error);
      throw new Error(supportEmailResponse.error.message || "Erro ao enviar mensagem para equipe de suporte");
    }

    console.log("Support team email sent successfully:", supportEmailResponse);

    // 2. Send a confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "HelloPeople Suporte <suporte@hellopeoplebr.com>",
      to: [email],
      subject: "Recebemos sua mensagem | HelloPeople",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E88E5;">Olá, ${name}!</h2>
          <p>Recebemos sua mensagem com o assunto: <strong>${subject}</strong></p>
          <p>Agradecemos seu contato! Nossa equipe de suporte irá analisar sua solicitação e responderá o mais breve possível.</p>
          <p>Para referência, aqui está uma cópia da sua mensagem:</p>
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 4px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p>Caso tenha mais alguma dúvida ou informação adicional, você pode responder diretamente a este email.</p>
          <p style="margin-top: 30px;">Atenciosamente,<br>Equipe HelloPeople</p>
          <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #666;">
            <p>© 2025 HelloPeople | Fazendo o aprendizado de idiomas mais eficaz</p>
          </div>
        </div>
      `,
    });

    if (userEmailResponse.error) {
      console.error("Error sending user confirmation email:", userEmailResponse.error);
      // We still return success if only the user confirmation email fails
      // but we log the error for monitoring
    } else {
      console.log("User confirmation email sent successfully:", userEmailResponse);
    }

    return new Response(JSON.stringify({ 
      success: true,
      supportEmail: supportEmailResponse,
      userEmail: userEmailResponse
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending support email:", error);
    
    // Provide more specific error messages based on the error
    let errorMessage = "Erro ao enviar mensagem";
    let statusCode = 500;
    
    if (error.message?.includes("verify a domain")) {
      errorMessage = "Erro de configuração do email: domínio não verificado";
      statusCode = 403;
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "Limite de envios de email excedido. Tente novamente mais tarde";
      statusCode = 429;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
