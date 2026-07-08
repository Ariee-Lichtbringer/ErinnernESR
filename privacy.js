const privacyConsentKey = "erinnern-esr-privacy-consent";

function showPrivacyConsent() {
  if (window.location.pathname.endsWith("datenschutz.html")) return;
  if (localStorage.getItem(privacyConsentKey) === "accepted") return;

  const overlay = document.createElement("div");
  overlay.className = "privacy-consent";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "privacyConsentTitle");
  overlay.innerHTML = `
    <div class="privacy-consent-box">
      <h2 id="privacyConsentTitle">Datenschutz</h2>
      <p>Diese Website verarbeitet Angaben, die für Anmeldung, Organisation und Unterlagen der Gedenkstättenfahrten benötigt werden.</p>
      <p>Bitte lies die Datenschutzbestimmungen und bestätige, dass du sie zur Kenntnis genommen hast.</p>
      <div class="privacy-actions">
        <a class="button compact" href="datenschutz.html">Datenschutz lesen</a>
        <button class="button primary" type="button" id="acceptPrivacyConsent">Zustimmen</button>
      </div>
    </div>
  `;

  document.body.append(overlay);
  document.querySelector("#acceptPrivacyConsent")?.addEventListener("click", () => {
    localStorage.setItem(privacyConsentKey, "accepted");
    overlay.remove();
  });
}

showPrivacyConsent();
