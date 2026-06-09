@echo off
REM Wrapper for Stripe CLI when it is not on PATH (Windows install via scripts).
set "STRIPE_EXE=%LOCALAPPDATA%\stripe-cli\stripe.exe"
if not exist "%STRIPE_EXE%" (
  echo Stripe CLI not found at %STRIPE_EXE%
  echo Install: winget install Stripe.StripeCli
  echo Or download: https://github.com/stripe/stripe-cli/releases
  exit /b 1
)
"%STRIPE_EXE%" %*
