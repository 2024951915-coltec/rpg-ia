(function () {
    const PROFILE_KEY = 'boulderspire.playerName';

    function getPlayerName() {
        try { return sessionStorage.getItem(PROFILE_KEY) || ''; }
        catch (_) { return ''; }
    }

    function setPlayerName(name) {
        const cleanName = String(name || '').trim().replace(/\s+/g, ' ');
        if (!cleanName) return false;
        try { sessionStorage.setItem(PROFILE_KEY, cleanName); } catch (_) { /* armazenamento opcional */ }
        return true;
    }

    document.addEventListener('DOMContentLoaded', function () {
        const nameInput = document.querySelector('#player-name');
        const continueButton = document.querySelector('#continue-to-campaign');
        const joinForm = document.querySelector('#join-campaign-form');
        const campaignForm = document.querySelector('#new-campaign-form');
        const characterName = document.querySelector('#uname');
        const roomCode = document.querySelector('[data-room-code]');
        const copyButton = document.querySelector('[data-copy-room]');

        if (nameInput) {
            nameInput.value = getPlayerName();
            if (continueButton) {
                continueButton.addEventListener('click', function () {
                    if (!nameInput.reportValidity() || !setPlayerName(nameInput.value)) return;
                    document.querySelector('#campaign-actions')?.classList.remove('d-none');
                    document.querySelector('#identity-step')?.classList.add('d-none');
                });
            }
            nameInput.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') { event.preventDefault(); continueButton?.click(); }
            });
        }

        if (joinForm) {
            joinForm.addEventListener('submit', function (event) {
                if (!getPlayerName()) {
                    event.preventDefault();
                    window.location.assign('/home');
                }
            });
        }

        if (campaignForm) {
            campaignForm.addEventListener('submit', function (event) {
                if (!getPlayerName()) {
                    event.preventDefault();
                    window.location.assign('/home');
                }
            });
        }

        if (characterName && !characterName.value) characterName.value = getPlayerName();

        if (roomCode && copyButton) {
            copyButton.addEventListener('click', async function () {
                const value = roomCode.textContent.trim();
                try {
                    await navigator.clipboard.writeText(value);
                    copyButton.textContent = 'Código copiado!';
                } catch (_) {
                    copyButton.textContent = 'Copie o código acima';
                }
            });
        }

        document.querySelectorAll('[data-confirm]').forEach(function (element) {
            element.addEventListener('click', function (event) {
                if (!window.confirm(element.getAttribute('data-confirm'))) event.preventDefault();
            });
        });
    });
})();
