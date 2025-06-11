import { Provider as lti } from 'ltijs';
import dotenv from 'dotenv';
dotenv.config();

async function register() {
  // Setup für MongoDB
  lti.setup(process.env.LTI_KEY, {
    url: process.env.MONGODB_URI
  }, {
    appUrl: '/lti/launch', // Kann angepasst werden, falls notwendig
    loginUrl: '/lti/oidc',
    cookie: {
      secure: false, // Für lokalen Test (Render = true + SameSite 'None')
      sameSite: 'Lax'
    },
    logger: true // Optional, aber hilft beim Debuggen
  });

  // Hier wird der Provider "deployt" (bereitgestellt)
  await lti.deploy({ serverless: true });

  // Registrierung der Plattform (Moodle)
  await lti.registerPlatform({
    url: 'https://moodle4.de',
    name: 'Moodle 4',
    clientId: 'XxPVRiQrGOOzw8A',  // Deine Moodle-Client-ID
    authenticationEndpoint: 'https://moodle4.de/mod/lti/auth.php',
    accesstokenEndpoint: 'https://moodle4.de/mod/lti/token.php',
    authConfig: {
      method: 'JWK_SET',
      key: 'https://moodle4.de/mod/lti/certs.php'
    }
  });

  console.log('✅ Plattform erfolgreich registriert!');
  process.exit(0);  // Beende das Skript nach der Registrierung
}

register().catch(err => {
  console.error('❌ Fehler bei Registrierung:', err);
  process.exit(1);
});
