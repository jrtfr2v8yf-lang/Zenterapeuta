import { Storage } from './storage.js';
import { Canvas } from './canvas.js';

export const Ajustes = {
    render(container) {
        this.container = container;
        const config = Storage.get('therapist_config') || { nombre: 'Giacinto Schiavone', whatsapp: '18326878443', email: 'Gspunto@gmail.com' };
        const signature = Storage.getTherapistSignature();

        this.container.innerHTML = `
            <h2>Configuración y Ajustes</h2>
            <div class="card">
                <h3>Información del Terapeuta</h3>
                <form id="config-form">
                    <div class="form-group">
                        <label>Nombre del Terapeuta</label>
                        <input type="text" name="nombre" value="${config.nombre}" placeholder="Giacinto Schiavone" required>
                    </div>
                    <div class="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" name="email" value="${config.email}" placeholder="Gspunto@gmail.com">
                    </div>
                    <div class="form-group">
                        <label>Número de WhatsApp (para recibir consentimientos)</label>
                        <input type="tel" name="whatsapp" value="${config.whatsapp}" placeholder="Ej: 18326878443" required>
                        <small>Incluya el código de país sin el símbolo +</small>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Guardar Información</button>
                </form>
            </div>

            <div class="card">
                <h3>Firma Digital del Terapeuta</h3>
                <p style="font-size: 0.85rem; margin-bottom: 1rem;">Esta firma aparecerá en todas sus notas SOAP.</p>
                <div class="canvas-container" style="height: 150px;">
                    <canvas id="therapist-sig-pad-settings" style="height: 150px;"></canvas>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button class="btn btn-secondary btn-sm" id="btn-clear-sig-settings" style="flex: 1;">Limpiar</button>
                    <button class="btn btn-primary btn-sm" id="btn-save-sig-settings" style="flex: 1;">Guardar Firma</button>
                </div>
                <div id="settings-sig-status" style="margin-top: 0.5rem; font-size: 0.8rem; text-align: center;">
                    ${signature ? '✅ Firma guardada actualmente.' : '❌ No hay firma guardada.'}
                </div>
            </div>

            <div class="card" style="background-color: var(--primary-very-light); border: 1px solid var(--primary-medium);">
                <h4>Sobre Giacinto Schiavone — Master LMT</h4>
                <p style="font-size: 0.9rem;">Aplicación personalizada para la gestión de Terapias Corporales Ayurveda & Yoga.</p>
            </div>
        `;

        this.initEvents(config);
    },

    initEvents(config) {
        const form = document.getElementById('config-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const newConfig = Object.fromEntries(formData.entries());
            Storage.save('therapist_config', newConfig);
            alert('Configuración guardada correctamente.');
        };

        const sig = Canvas.init('therapist-sig-pad-settings');
        const statusEl = document.getElementById('settings-sig-status');

        document.getElementById('btn-clear-sig-settings').onclick = () => sig.clear();

        document.getElementById('btn-save-sig-settings').onclick = () => {
            if (sig.isEmpty()) return alert('Por favor, firme antes de guardar.');
            Storage.saveTherapistSignature(sig.getDataURL());
            statusEl.textContent = '✅ Firma guardada correctamente.';
            statusEl.style.color = 'var(--primary-dark)';
            alert('Firma guardada correctamente.');
        };
    }
};
