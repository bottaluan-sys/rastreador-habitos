# Como gerar o APK do Rastreador de Hábitos

O projeto foi configurado com **Capacitor** para gerar um APK Android.

## Opção 1: Gerar APK pelo GitHub (sem instalar nada)

1. Crie um repositório no GitHub (ex: `rastreador-habitos`)
2. Envie o código:
   ```bash
   git init
   git add .
   git commit -m "Configuração inicial"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/rastreador-habitos.git
   git push -u origin main
   ```
3. No GitHub: **Actions** → **Gerar APK Android** → **Run workflow**
4. Quando terminar, baixe o APK em **Actions** → clique na execução → **Artifacts** → **app-debug-apk**

---

## Opção 2: Gerar APK no seu PC (com Android Studio)

### Pré-requisitos

1. **Android Studio** – necessário para ter o Android SDK instalado  
   - Baixe em: https://developer.android.com/studio  
   - Durante a instalação, marque a opção para instalar o Android SDK

2. **Java JDK 17** – geralmente já vem com o Android Studio

## Configurar o Android SDK

Após instalar o Android Studio:

1. Abra o Android Studio e conclua o assistente de configuração inicial
2. O SDK será instalado em: `C:\Users\<seu_usuario>\AppData\Local\Android\Sdk`
3. Configure a variável de ambiente **ANDROID_HOME**:
   - Painel de Controle → Sistema → Configurações avançadas → Variáveis de ambiente
   - Crie uma nova variável: `ANDROID_HOME` = `C:\Users\Luan\AppData\Local\Android\Sdk`
   - Adicione ao PATH: `%ANDROID_HOME%\platform-tools` e `%ANDROID_HOME%\tools`

**Ou** crie o arquivo `android/local.properties` com:

```
sdk.dir=C:\\Users\\Luan\\AppData\\Local\\Android\\Sdk
```

(Ajuste o caminho se o SDK estiver em outro local.)

## Gerar o APK

No terminal, na pasta do projeto:

```bash
# 1. Sincronizar o build web com o projeto Android
npm run android:sync

# 2. Gerar o APK de debug
cd android
.\gradlew.bat assembleDebug
```

O APK será gerado em:

```
android\app\build\outputs\apk\debug\app-debug.apk
```

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `npm run android:sync` | Faz build web e sincroniza com o Android |
| `npm run android:open` | Abre o projeto no Android Studio |
| `npm run android:build` | Sincroniza e executa no emulador/dispositivo |

## APK de release (para publicar na Play Store)

Para gerar um APK assinado para publicação:

1. Abra o projeto no Android Studio: `npm run android:open`
2. Menu **Build** → **Generate Signed Bundle / APK**
3. Siga o assistente para criar uma chave de assinatura e gerar o APK
