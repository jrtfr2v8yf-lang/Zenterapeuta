import { Storage } from './storage.js';
import { Canvas } from './canvas.js';

export const Soap = {
    render(container) {
        this.container = container;
        const clients = Storage.getClients();
        
        if (clients.length === 0) {
            this.container.innerHTML = `
                <h2>Notas SOAP</h2>
                <div class="card">
                    <p>Primero debe registrar al menos un cliente para crear una nota SOAP.</p>
                </div>
            `;
            return;
        }

        this.showSelection(clients);
    },

    showSelection(clients) {
        const config = Storage.get('therapist_config') || { nombre: '' };
        this.container.innerHTML = `
            <h2>Nueva Nota SOAP</h2>
            <div class="card">
                <div class="form-group">
                    <label>Seleccionar Cliente</label>
                    <select id="soap-client">
                        <option value="">-- Seleccione un cliente --</option>
                        ${clients.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                    </select>
                </div>
                <button class="btn btn-primary" id="btn-next-soap">Continuar</button>
            </div>

            <div class="card" style="margin-top: 2rem; border: 1px dashed var(--primary-medium);">
                <h3>Terapeuta: ${config.nombre || 'No configurado'}</h3>
                <p style="font-size: 0.85rem; margin-bottom: 1rem;">La firma se gestiona en la sección de <strong>Ajustes</strong>.</p>
                ${Storage.getTherapistSignature() ? '✅ Firma digital lista.' : '❌ Falta firma digital. Vaya a Ajustes.'}
            </div>
        `;

        document.getElementById('btn-next-soap').onclick = () => {
            const clientId = document.getElementById('soap-client').value;
            if (!clientId) return alert('Seleccione un cliente');
            if (!Storage.getTherapistSignature()) return alert('Por favor, guarde su firma de terapeuta en Ajustes primero.');
            this.showForm(clientId);
        };
    },

    showForm(clientId) {
        const client = Storage.getClients().find(c => c.id === clientId);
        this.container.innerHTML = `
            <div class="header-actions">
                <h2>Nota SOAP: ${client.nombre}</h2>
                <button class="btn btn-secondary" id="btn-back-soap-selection">Volver</button>
            </div>
            
            <form id="soap-form">
                <div class="card">
                    <h3>Control</h3>
                    <div class="form-group">
                        <label>Fecha de Servicio</label>
                        <input type="date" name="fecha" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label>Duración (minutos)</label>
                        <select name="duracion">
                            <option value="30">30 min</option>
                            <option value="60" selected>60 min</option>
                            <option value="90">90 min</option>
                            <option value="120">120 min</option>
                        </select>
                    </div>
                </div>

                <div class="card">
                    <h3>S (Subjetivo)</h3>
                    <div class="form-group">
                        <label>Escala de Dolor (0-10)</label>
                        <input type="range" name="dolor" min="0" max="10" value="0" oninput="this.nextElementSibling.value = this.value">
                        <output>0</output>
                    </div>
                    <div class="form-group">
                        <label>Queja Principal</label>
                        <textarea name="queja" placeholder="Ej: Dolor en zona lumbar..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Actividades que agravan/mitigan</label>
                        <textarea name="actividades" placeholder="Ej: Empeora al estar sentado mucho tiempo..."></textarea>
                    </div>
                </div>

                <div class="card">
                    <h3>O (Objetivo)</h3>
                    <div class="form-group">
                        <label>Observación Visual (postura, marcha)</label>
                        <textarea name="observacion" placeholder="Ej: Hombro derecho elevado..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Palpación (hipertonía, puntos gatillo)</label>
                        <textarea name="palpacion" placeholder="Ej: Puntos gatillo en trapecios..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Rango de Movimiento</label>
                        <select name="rom">
                            <option value="Normal">Normal</option>
                            <option value="Limitado">Limitado</option>
                            <option value="Doloroso">Doloroso</option>
                            <option value="Limitado y Doloroso">Limitado y Doloroso</option>
                        </select>
                    </div>
                </div>

                <div class="card">
                    <h3>A (Análisis / Evaluación)</h3>
                    <div class="form-group">
                        <label>Tipo de Masaje</label>
                        <select name="tipoMasaje">
                            <option value="Relajante">Relajante</option>
                            <option value="Descontracturante">Descontracturante</option>
                            <option value="Deportivo">Deportivo</option>
                            <option value="Drenaje Linfático">Drenaje Linfático</option>
                            <option value="Terapéutico">Terapéutico</option>
                            <option value="Ayurveda">Ayurveda</option>
                            <option value="Yoga Terapia">Yoga Terapia</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Áreas Trabajadas</label>
                        <textarea name="areas" placeholder="Ej: Espalda completa, cuello y glúteos..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Respuesta del Tejido</label>
                        <textarea name="respuesta" placeholder="Ej: Liberación de tensión palpable en zona lumbar..."></textarea>
                    </div>
                </div>

                <div class="card">
                    <h3>P (Plan)</h3>
                    <div class="form-group">
                        <label>Recomendaciones Post-sesión</label>
                        <textarea name="recomendaciones" placeholder="Ej: Hidratación aumentada, estiramientos de psoas..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Frecuencia Sugerida</label>
                        <input type="text" name="frecuencia" placeholder="Ej: 1 vez por semana durante 1 mes">
                    </div>
                    <div class="form-group">
                        <label>Objetivos a Largo Pelazo</label>
                        <textarea name="objetivos" placeholder="Ej: Recuperar rango completo de rotación cervical..."></textarea>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">Guardar Nota SOAP</button>
                <button type="button" class="btn btn-whatsapp" id="btn-whatsapp-soap">📱 Enviar Resumen SOAP por WhatsApp</button>
            </form>
        `;

        document.getElementById('btn-back-soap-selection').onclick = () => this.render(this.container);

        document.getElementById('btn-whatsapp-soap').onclick = () => {
            const form = document.getElementById('soap-form');
            const formData = new FormData(form);
            this.sendWhatsApp(clientId, formData);
        };

        document.getElementById('soap-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = this.formatData(clientId, formData);
            Storage.addSoap(data);
            alert('Nota SOAP guardada exitosamente.');
            this.render(this.container);
        };
    },

    formatData(clientId, formData) {
        return {
            clientId,
            fecha: formData.get('fecha'),
            duracion: formData.get('duracion'),
            subjetivo: {
                dolor: formData.get('dolor'),
                queja: formData.get('queja'),
                actividades: formData.get('actividades')
            },
            objetivo: {
                observacion: formData.get('observacion'),
                palpacion: formData.get('palpacion'),
                rom: formData.get('rom')
            },
            analisis: {
                tipoMasaje: formData.get('tipoMasaje'),
                areas: formData.get('areas'),
                respuesta: formData.get('respuesta')
            },
            plan: {
                recomendaciones: formData.get('recomendaciones'),
                frecuencia: formData.get('frecuencia'),
                objetivos: formData.get('objetivos')
            },
            therapistSig: Storage.getTherapistSignature()
        };
    },

    sendWhatsApp(clientId, formData) {
        const config = Storage.get('therapist_config');
        if (!config || !config.whatsapp) {
            return alert('Configure su número en Ajustes primero.');
        }

        const client = Storage.getClients().find(c => c.id === clientId);
        const data = this.formatData(clientId, formData);
        
        const message = `*Giacinto Schiavone — Master LMT*\n` +
            `*Resumen de Sesión SOAP*\n\n` +
            `*Cliente:* ${client.nombre}\n` +
            `*Fecha:* ${data.fecha}\n` +
            `*Duración:* ${data.duracion} min\n\n` +
            `*S:* Dolor ${data.subjetivo.dolor}/10. ${data.subjetivo.queja}\n` +
            `*A:* ${data.analisis.tipoMasaje} en ${data.analisis.areas}\n` +
            `*P:* ${data.plan.recomendaciones}. Frecuencia: ${data.plan.frecuencia}\n\n` +
            `Firmado por ${config.nombre || 'el terapeuta'}.\n` +
            `_Terapias Corporales Ayurveda & Yoga_`;

        const encodedMsg = encodeURIComponent(message);
        const waUrl = `https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodedMsg}`;
        window.open(waUrl, '_blank');
    }
};
