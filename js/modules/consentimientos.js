import { Storage } from './storage.js';
import { Canvas } from './canvas.js';

export const Consentimientos = {
    textos: {
        'Masaje General (AMTA)': 'Declaro que entiendo que el masaje terapéutico es para fines de bienestar, relajación y alivio muscular. Reconozco que no reemplaza un examen ni diagnóstico médico. Acepto la política de cancelación de 24 horas. Entiendo que tengo derecho a detener la sesión en cualquier momento. Confirmo que se me han explicado los límites profesionales establecidos por la AMTA.',
        'Aromaterapia': 'Entiendo que se utilizarán aceites esenciales puros durante la sesión. Declaro no tener alergias cutáneas o respiratorias conocidas a los aceites esenciales. Entiendo que debo informar cualquier sensibilidad olfativa o reacción adversa durante la sesión.',
        'Terapia Craneosacral': 'Entiendo que la terapia craneosacral es una técnica de manipulación sutil del sistema cráneo-sacro que implica una presión muy ligera. Desmiento cualquier expectativa de presión fuerte o manipulación ósea agresiva. Declaro no tener presión intracraneal elevada, aneurismas ni condiciones que contraindiquen esta técnica.',
        'Masaje Tailandés': 'Entiendo que el masaje tailandés incluye estiramientos pasivos asistidos, presiones profundas, movilizaciones articulares y trabajo en el suelo con ropa cómoda. Me comprometo a comunicar mis límites de flexibilidad y cualquier molestia durante los estiramientos.',
        'Masaje Prenatal': 'Entiendo que hay zonas reflejas contraindicadas durante el embarazo. Libero al terapeuta de responsabilidad por reacciones adversas relacionadas con dichas zonas.'
    },

    contraindicaciones: [
        'Fiebre', 'Inflamación aguda', 'Enfermedades contagiosas', 'Fracturas recientes', 
        'Trombosis / Flebitis', 'Cáncer (en tratamiento activo)', 'Presión arterial no controlada',
        'Heridas abiertas o quemaduras', 'Varices severas'
    ],

    render(container) {
        this.container = container;
        const clients = Storage.getClients();
        
        if (clients.length === 0) {
            this.container.innerHTML = `
                <h2>Consentimientos</h2>
                <div class="card">
                    <p>Primero debe registrar al menos un cliente para generar un consentimiento.</p>
                </div>
            `;
            return;
        }

        this.showSelection(clients);
    },

    showSelection(clients) {
        this.container.innerHTML = `
            <h2>Nuevo Consentimiento</h2>
            <div class="card">
                <div class="form-group">
                    <label>Seleccionar Cliente</label>
                    <select id="consent-client">
                        <option value="">-- Seleccione un cliente --</option>
                        ${clients.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tipo de Masaje / Consentimiento</label>
                    <select id="consent-type">
                        ${Object.keys(this.textos).map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                    </select>
                </div>
                <button class="btn btn-primary" id="btn-next-consent">Continuar</button>
            </div>
        `;

        document.getElementById('btn-next-consent').onclick = () => {
            const clientId = document.getElementById('consent-client').value;
            const type = document.getElementById('consent-type').value;
            if (!clientId) return alert('Seleccione un cliente');
            this.showForm(clientId, type);
        };
    },

    showForm(clientId, type) {
        const client = Storage.getClients().find(c => c.id === clientId);
        const isPrenatal = type === 'Masaje Prenatal';

        this.container.innerHTML = `
            <div class="header-actions">
                <h2>Consentimiento: ${type}</h2>
                <button class="btn btn-secondary" id="btn-back-selection">Volver</button>
            </div>
            <div class="card">
                <p><strong>Cliente:</strong> ${client.nombre}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
                <hr style="margin: 1rem 0;">
                
                ${isPrenatal ? `
                    <div class="form-group">
                        <label>Semanas de gestación:</label>
                        <input type="number" id="prenatal-weeks" placeholder="Ej: 24" style="width: 100px;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: normal; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" id="prenatal-auth"> Adjunto autorización médica (si embarazo de alto riesgo)
                        </label>
                    </div>
                ` : ''}

                <p style="white-space: pre-line;">${this.textos[type]}</p>
                
                <h4 style="margin: 1.5rem 0 0.5rem;">Contraindicaciones (marcar si presenta):</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    ${this.contraindicaciones.map(c => `
                        <label style="font-weight: normal; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" name="contra" value="${c}"> ${c}
                        </label>
                    `).join('')}
                </div>

                <h4 style="margin: 1.5rem 0 0.5rem;">Firma del Cliente:</h4>
                <div class="canvas-container">
                    <canvas id="signature-pad"></canvas>
                </div>
                <button class="btn btn-secondary btn-sm" id="btn-clear-sig">Limpiar Firma</button>

                <div style="margin-top: 2rem;">
                    <button class="btn btn-primary" id="btn-save-consent" style="width: 100%;">💾 Guardar Consentimiento</button>
                    <button class="btn btn-whatsapp" id="btn-whatsapp-consent">📱 Enviar Consentimiento por WhatsApp</button>
                </div>
            </div>
        `;

        const sig = Canvas.init('signature-pad');
        
        document.getElementById('btn-clear-sig').onclick = () => sig.clear();
        document.getElementById('btn-back-selection').onclick = () => this.render(this.container);

        document.getElementById('btn-save-consent').onclick = () => {
            if (sig.isEmpty()) return alert('La firma es obligatoria');
            this.processConsent(clientId, type, sig, false);
        };

        document.getElementById('btn-whatsapp-consent').onclick = () => {
            if (sig.isEmpty()) return alert('La firma es obligatoria');
            this.processConsent(clientId, type, sig, true);
        };
    },

    processConsent(clientId, type, sig, sendWhatsApp) {
        const config = Storage.get('therapist_config');
        if (sendWhatsApp && (!config || !config.whatsapp)) {
            return alert('Por favor, configure su número de WhatsApp en la sección de Ajustes primero.');
        }

        const client = Storage.getClients().find(c => c.id === clientId);
        const checkboxes = this.container.querySelectorAll('input[name="contra"]:checked');
        const contraindicaciones = Array.from(checkboxes).map(cb => cb.value);
        const signatureImg = sig.getDataURL();
        const date = new Date().toLocaleDateString();

        let extraInfo = '';
        if (type === 'Masaje Prenatal') {
            const weeks = document.getElementById('prenatal-weeks').value;
            const auth = document.getElementById('prenatal-auth').checked;
            extraInfo = `Semanas de gestación: ${weeks || 'N/A'}. Autorización médica: ${auth ? 'Sí' : 'No'}.`;
        }

        const consentData = {
            clientId,
            tipo: type,
            contraindicaciones,
            extraInfo,
            signatureImg,
            textLegal: this.textos[type]
        };

        Storage.addConsent(consentData);

        if (sendWhatsApp) {
            const contraText = contraindicaciones.length > 0 
                ? `Contraindicaciones marcadas: ${contraindicaciones.join(', ')}.` 
                : 'Sin contraindicaciones marcadas.';
            
            const message = `*Giacinto Schiavone — Master LMT*\n` +
                `*Consentimiento Informado*\n\n` +
                `*Cliente:* ${client.nombre}\n` +
                `*Tipo:* ${type}\n` +
                `*Fecha:* ${date}\n` +
                `${extraInfo ? `*Info:* ${extraInfo}\n` : ''}\n` +
                `*Declaración:* ${this.textos[type]}\n\n` +
                `*${contraText}*\n\n` +
                `Firmado digitalmente por ${client.nombre} el ${date}.\n\n` +
                `_Terapias Corporales Ayurveda & Yoga_\n` +
                `Contacto: ${config.email || '—'}`;

            const encodedMsg = encodeURIComponent(message);
            // Open WA with Therapist's number as per instructions
            const waUrl = `https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodedMsg}`;
            window.open(waUrl, '_blank');
        }

        alert('Consentimiento guardado exitosamente.');
        this.render(this.container);
    }
};
