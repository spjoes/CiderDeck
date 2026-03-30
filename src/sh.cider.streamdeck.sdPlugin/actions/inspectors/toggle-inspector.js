// Property inspector for Toggle Playback — per-key action settings + shared global auth (actionType null avoids syncing into global tree).

let tempSettings = {};

document.addEventListener('DOMContentLoaded', function() {
    baseInspector.initialize({
        actionType: null,
        onActionSettingsReceived: handleActionSettingsUpdate,
        onGlobalSettingsReceived: handleGlobalSettingsUpdate,
        addGlobalSettingsTab: false
    });

    initUI();
});

function handleGlobalSettingsUpdate(globalSettings) {
    tempSettings = JSON.parse(JSON.stringify(globalSettings));
    loadSettingsToUI();
}

function handleActionSettingsUpdate(settings) {
    console.log('Toggle action settings updated:', settings);
}

$PI.onConnected(() => {
    $PI.getGlobalSettings();
});

$PI.onDidReceiveGlobalSettings(({payload}) => {
    tempSettings = validateGlobalSettings(payload.settings || {});
    loadSettingsToUI();
});

function initUI() {
    const saveButton = document.getElementById('save-settings');
    // Replace BaseInspector's save handler so we save per-key settings and global auth in one click
    saveButton.onclick = (event) => {
        event.preventDefault();
        saveSettings();
    };

    document.getElementById('reset-settings').addEventListener('click', (event) => {
        event.preventDefault();
        resetSettings();
    });
}

function loadSettingsToUI() {
    const authKey = document.getElementById('authKey');
    if (authKey) {
        authKey.value = tempSettings.global?.authorization?.rpcKey ||
                         tempSettings.authorization?.rpcKey || '';
    }
}

function saveSettings() {
    baseInspector.saveActionSettings();
    baseInspector.saveGlobalSettings();

    const button = document.getElementById('save-settings');
    const originalText = button.innerText;
    button.innerText = "✓ Saved!";
    setTimeout(() => {
        button.innerText = originalText;
    }, 2000);

    console.log('Toggle inspector saved:', baseInspector.actionSettings, baseInspector.globalSettings);
}

function resetSettings() {
    if (!tempSettings.global) tempSettings.global = {};
    if (!tempSettings.global.authorization) tempSettings.global.authorization = {};
    tempSettings.global.authorization.rpcKey = "";

    if (!tempSettings.authorization) tempSettings.authorization = {};
    tempSettings.authorization.rpcKey = "";

    loadSettingsToUI();

    const button = document.getElementById('reset-settings');
    const originalText = button.innerText;
    button.innerText = "✓ Reset!";
    setTimeout(() => {
        button.innerText = originalText;
    }, 2000);
}

function validateGlobalSettings(settings) {
    return {
        ...settings,
        marqueeSettings: {
            enabled: settings.marqueeSettings?.enabled ?? true,
            speed: settings.marqueeSettings?.speed ?? 200,
            length: settings.marqueeSettings?.length ?? 15,
            delay: settings.marqueeSettings?.delay ?? 2000
        },
        tapSettings: {
            tapBehavior: settings.tapSettings?.tapBehavior ?? "addToLibrary"
        },
        knobSettings: {
            pressBehavior: settings.knobSettings?.pressBehavior ?? "togglePlay",
            volumeStep: settings.knobSettings?.volumeStep ?? 1
        },
        authorization: {
            rpcKey: settings.authorization?.rpcKey ?? ""
        },
        global: {
            ...(settings.global || {}),
            authorization: {
                ...(settings.global?.authorization || {}),
                rpcKey: settings.global?.authorization?.rpcKey ?? settings.authorization?.rpcKey ?? ""
            }
        }
    };
}
