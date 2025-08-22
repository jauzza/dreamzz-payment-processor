# 🚀 Dreamzz Payment Processor

A modern payment processing system that integrates Stripe payments with Telegram and Discord membership management. Automatically generates one-time invite links and verification codes for paid members.

## ✨ Features

### 💳 Payment Processing
- **Stripe Integration** - Secure payment processing with multiple payment methods
- **Subscription Management** - Monthly and lifetime membership plans
- **VAT Handling** - Automatic tax calculation and inclusion
- **Webhook Support** - Real-time payment confirmation and processing

### 🤖 Telegram Integration
- **One-Time Invite Links** - Secure, single-use Telegram group invites
- **Automatic Member Tracking** - Monitor subscription status and expiry
- **Member Cleanup** - Automated removal of expired monthly members
- **Bot Admin Management** - Full control over group membership

### 🎮 Discord Integration
- **Verification System** - Secure code-based role assignment
- **External Bot Support** - Works with existing Discord bots via API
- **Role Management** - Automatic role assignment for paying members
- **Slash Commands** - Easy integration with Discord bot commands

### 🔒 Security Features
- **Session Verification** - Stripe session validation for all operations
- **Self-Destructing Links** - Links expire after first use
- **Time-Based Access** - 15-minute session expiry for success pages
- **Duplicate Prevention** - Prevents multiple link generation

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Payment:** Stripe API
- **Telegram:** node-telegram-bot-api
- **Discord:** Discord API (direct integration)
- **Deployment:** Vercel
- **Language:** TypeScript

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Stripe account
- Telegram bot token
- Discord bot token
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jauzza/dreamzz-payment-processor.git
cd dreamzz-payment-processor
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Discord Configuration
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_SERVER_ID=your_server_id
DISCORD_MONTHLY_ROLE_ID=monthly_role_id
DISCORD_LIFETIME_ROLE_ID=lifetime_role_id

# Security
CRON_SECRET=your_cron_secret
```

4. **Run the development server**
```bash
npm run dev
```

## 📡 API Endpoints

### Payment Processing
- `POST /api/create-checkout-session` - Create Stripe checkout session
- `POST /api/webhook` - Handle Stripe webhook events
- `GET /api/verify-session` - Verify payment session status

### Link Generation
- `POST /api/generate-links` - Generate Telegram invite and Discord code
- `GET /api/get-links` - Retrieve generated links (one-time access)
- `POST /api/test-generate` - Manual link generation (debug)

### Discord Integration
- `POST /api/discord/verify-code` - Verify Discord verification code
- `POST /api/discord/assign-role` - Assign role to Discord user
- `POST /api/discord/init-bot` - Initialize Discord bot connection
- `POST /api/discord/clear-codes` - Clear used verification codes

### Telegram Integration
- `POST /api/telegram-webhook` - Handle Telegram bot updates
- `POST /api/setup-telegram-webhook` - Set up Telegram webhook

### Member Management
- `GET /api/members` - View member statistics
- `POST /api/cleanup-expired` - Remove expired monthly members
- `POST /api/cron` - Cron job endpoint for daily cleanup

## 🎯 Usage Flow

### 1. Customer Payment
1. Customer visits the website
2. Selects monthly (€14.99) or lifetime (€34.99) plan
3. Completes payment via Stripe
4. Redirected to success page

### 2. Link Generation
1. Stripe webhook triggers on successful payment
2. System generates one-time Telegram invite link
3. System generates Discord verification code
4. Links stored securely with session validation

### 3. Access Provision
1. Customer accesses success page with session ID
2. Links are retrieved and immediately deleted (one-time use)
3. Customer receives Telegram invite and Discord code
4. Session expires after 15 minutes

### 4. Member Management
1. **Telegram:** Customer joins with invite link, bot tracks membership
2. **Discord:** Customer uses verification code with bot command
3. **Monthly members:** Automatically removed after 32 days
4. **Lifetime members:** Permanent access

## 🔧 Discord Bot Integration

### For External Discord Bots

Add this command to your Discord bot:

```javascript
// Example Discord.js command
client.on('interactionCreate', async interaction => {
  if (interaction.commandName === 'verify') {
    const code = interaction.options.getString('code');
    
    // Verify code with our API
    const response = await fetch('https://your-domain.com/api/discord/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code, 
        discordUserId: interaction.user.id 
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Assign role
      await interaction.guild.members.cache
        .get(interaction.user.id)
        .roles.add(result.roleId);
      
      await interaction.reply('✅ Role assigned successfully!');
    } else {
      await interaction.reply('❌ Invalid or expired code!');
    }
  }
});
```

## 🌐 Deployment

### Vercel Deployment

1. **Connect to Vercel**
```bash
vercel
```

2. **Set environment variables** in Vercel dashboard

3. **Configure webhooks**
   - Stripe webhook: `https://your-domain.com/api/webhook`
   - Telegram webhook: `https://your-domain.com/api/telegram-webhook`

4. **Set up cron job** (optional)
   - Use cron-job.org or similar service
   - Daily trigger: `https://your-domain.com/api/cron?secret=your_cron_secret`

## 🔐 Security Considerations

- **Environment Variables** - Never commit sensitive keys
- **Webhook Verification** - Always verify Stripe webhook signatures
- **Session Validation** - All operations require valid Stripe session
- **Rate Limiting** - Consider implementing rate limiting for production
- **Database** - Current implementation uses in-memory storage (not suitable for production)

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ✅ |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | ✅ |
| `TELEGRAM_CHAT_ID` | Telegram group chat ID | ✅ |
| `DISCORD_BOT_TOKEN` | Discord bot token | ✅ |
| `DISCORD_SERVER_ID` | Discord server ID | ✅ |
| `DISCORD_MONTHLY_ROLE_ID` | Monthly member role ID | ✅ |
| `DISCORD_LIFETIME_ROLE_ID` | Lifetime member role ID | ✅ |
| `CRON_SECRET` | Secret for cron job authentication | ❌ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the webhook logs

---

**Built with ❤️ for seamless payment processing and community management** 