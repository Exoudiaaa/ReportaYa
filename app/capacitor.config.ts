import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.muni.reportaya',
  appName: 'ReportaYa',
  webDir: 'www',
  plugins: {
    SocialLogin: {
      google : {
        webclientId: '102037866021-8jmum6fhgrhbpac4c6ckk3rfbbecskvs.apps.googleusercontent.com',
        scope : ['email', 'profile'],
      }
    }
  }
};

export default config;
