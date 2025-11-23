import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

async function getUncachableResendClient() {
  const {apiKey, fromEmail} = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'noreply@agentcraft.com'
  };
}

export async function sendPasswordResetEmail(email: string, resetToken: string, baseUrl: string) {
  try {
    const {client, fromEmail} = await getUncachableResendClient();
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    await client.emails.send({
      from: fromEmail,
      to: email,
      subject: 'AgentCraft - Reset Your Password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700;">Reset Your Password</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password for your AgentCraft account. Click the button below to create a new password:
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 14px;">
            Or copy and paste this URL into your browser:<br>
            <span style="color: #666;">${resetUrl}</span>
          </p>
        </div>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendWelcomeEmail(email: string, firstName?: string) {
  try {
    const {client, fromEmail} = await getUncachableResendClient();
    const name = firstName || 'there';
    
    await client.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to AgentCraft!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700;">Welcome to AgentCraft, ${name}!</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We're excited to have you on board. AgentCraft makes it easy for small businesses to automate tasks with AI-powered agents.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Get started by creating your first AI agent in under 60 seconds!
          </p>
          <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://agentcraft.com'}/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0;">
            Go to Dashboard
          </a>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - welcome email is not critical
    return false;
  }
}
