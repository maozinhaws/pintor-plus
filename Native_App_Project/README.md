# Pintor Plus — Projeto Nativo (Capacitor)

Este diretório contém a configuração para empacotar o Pintor Plus PWA como um aplicativo nativo usando o [Capacitor](https://capacitorjs.com/) da Ionic.

---

## Pré-requisitos

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Android Studio** (para builds Android)
- **Xcode** ≥ 15 com macOS (para builds iOS)
- **Java JDK** ≥ 17 (para Android)

---

## Início Rápido

### 1. Instalar dependências

```bash
cd Native_App_Project
npm install
```

### 2. Modo Live (aponta para o servidor remoto)

O `capacitor.config.json` está configurado para usar a URL de produção:
```
https://pintorplus.com.br/app.html
```

Para desenvolvimento local, edite `capacitor.config.json` e altere `server.url` para:
```json
"url": "http://SEU_IP_LOCAL:3000/app.html"
```

### 3. Adicionar plataformas

```bash
npx cap add android
npx cap add ios
```

### 4. Sincronizar assets

Após qualquer mudança no web app:

```bash
npx cap sync
```

### 5. Abrir nas IDEs nativas

```bash
# Android Studio
npx cap open android

# Xcode (macOS)
npx cap open ios
```

---

## Configuração do Google OAuth para Apps Nativos

Quando o app roda no Capacitor (Android/iOS), o fluxo OAuth do Google precisa usar
um **Custom URL Scheme** em vez de redirecionamento HTTP.

### Opção recomendada: Plugin `@codetrix-studio/capacitor-google-auth`

```bash
npm install @codetrix-studio/capacitor-google-auth
npx cap sync
```

Configure em `capacitor.config.json`:
```json
{
  "plugins": {
    "GoogleAuth": {
      "scopes": [
        "profile",
        "email",
        "https://www.googleapis.com/auth/drive.appdata",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/contacts.readonly"
      ],
      "serverClientId": "SEU_OAUTH_CLIENT_ID.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    }
  }
}
```

No **Google Cloud Console** → APIs & Services → Credentials:
- Adicione um **Android OAuth Client** com o SHA-1 da sua keystore de release
- Adicione um **iOS OAuth Client** com o Bundle ID `br.com.pintorplus.app`

---

## Deep Linking — Android App Links

Para que links `web+pintorplus://` funcionem no app nativo, é necessário:

1. Gerar o SHA-256 da keystore de release:
   ```bash
   keytool -list -v -keystore release.keystore -alias minha-chave
   ```

2. Atualizar o arquivo `/.well-known/assetlinks.json` no servidor com o fingerprint gerado.

3. No `AndroidManifest.xml` (gerado pelo Capacitor em `android/app/src/main/`), adicionar:
   ```xml
   <intent-filter android:autoVerify="true">
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="https" android:host="pintorplus.com.br" />
   </intent-filter>
   <intent-filter>
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="web+pintorplus" />
   </intent-filter>
   ```

---

## Deep Linking — iOS Universal Links

1. Crie o arquivo `apple-app-site-association` (sem extensão) em `/.well-known/`:
   ```json
   {
     "applinks": {
       "apps": [],
       "details": [
         {
           "appID": "TEAM_ID.br.com.pintorplus.app",
           "paths": ["/app.html", "/app.html/*"]
         }
       ]
     }
   }
   ```

2. No Xcode → Signing & Capabilities → adicione **Associated Domains**:
   ```
   applinks:pintorplus.com.br
   ```

---

## Política de Privacidade

A política de privacidade está em `/privacy-policy.html` e é acessível em:

- **URL permanente:** `https://pintorplus.com.br/privacy-policy`  
  *(o redirecionamento está configurado em `vercel.json`)*

### Ações necessárias para as lojas:

| Ação | Onde |
|------|------|
| Registrar URL da política na Play Store | Google Play Console → App content → Privacy policy |
| Registrar URL da política na App Store | App Store Connect → App Information → Privacy Policy URL |
| Atualizar no Google Cloud Console | APIs & Services → OAuth consent screen → Privacy Policy URL |
| Atualizar domínio autorizado | APIs & Services → OAuth consent screen → Authorized domains |

### URL da política de privacidade a usar:
```
https://pintorplus.com.br/privacy-policy
```

---

## Estrutura de Arquivos

```
Native_App_Project/
├── package.json          ← Dependências Capacitor
├── capacitor.config.json ← Configuração do app nativo
└── README.md             ← Este guia

# Após "npx cap add android/ios":
android/                  ← Projeto Android Studio
ios/                      ← Projeto Xcode
```

---

## Checklist de Release

- [ ] Atualizar `version` em `package.json` e `capacitor.config.json`
- [ ] Gerar ícones e splash screens nativos com `@capacitor/assets`
- [ ] Assinar o APK/AAB com keystore de release
- [ ] Atualizar `assetlinks.json` com SHA-256 da keystore de release
- [ ] Testar deep links em dispositivo físico
- [ ] Testar notificações push em modo release
- [ ] Verificar OAuth em dispositivo físico com conta real
