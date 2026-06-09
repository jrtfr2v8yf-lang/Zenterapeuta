import { Storage } from './storage.js';

export const Clientes = {
    render(container) {
        this.container = container;
        this.showList();
    },

    showList() {
        const clients = Storage.getClients();
        this.container.innerHTML = `
            <div class="header-actions">
                <h2>Directorio de Clientes</h2>
                <button class="btn btn-primary" id="btn-add-client">+ Nuevo Cliente</button>
            </div>
            <div class="card">
                ${clients.length === 0 ? '<p>No hay clientes registrados.</p>' : `
                    <ul class="client-list">
                        ${clients.map(client => `
                            <li class="client-item" data-id="${client.id}">
                                <div class="client-info">
                                    <h3>${client.nombre}</h3>
                                    <p>📞 ${client.telefono} | 📧 ${client.email}</p>
                                </div>
                                <div class="client-actions">
                                    <button class="btn btn-secondary btn-sm btn-history">Historial</button>
                                    <button class="btn btn-secondary btn-sm btn-edit">✏️</button>
                                    <button class="btn btn-secondary btn-sm btn-delete">🗑️</button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                `}
            </div>
        `;

        document.getElementById('btn-add-client').onclick = () => this.showForm();
        
        this.container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.closest('.client-item').dataset.id;
                const client = clients.find(c => c.id === id);
                this.showForm(client);
            };
        });

        this.container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.closest('.client-item').dataset.id;
                if (confirm('¿Estás seguro de eliminar este cliente?')) {
                    Storage.deleteClient(id);
                    this.showList();
                }
            };
        });

        this.container.querySelectorAll('.btn-history').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.closest('.client-item').dataset.id;
                this.viewHistory(id);
            };
        });
    },

    showForm(client = null) {
        this.container.innerHTML = `
            <h2>${client ? 'Editar' : 'Nuevo'} Cliente</h2>
            <form id="client-form" class="card">
                <div class="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" name="nombre" value="${client ? client.nombre : ''}" required>
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="tel" name="telefono" value="${client ? client.telefono : ''}" required>
                </div>
                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" name="email" value="${client ? client.email : ''}" required>
                </div>
                <div class="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input type="date" name="fechaNacimiento" value="${client ? client.fechaNacimiento : ''}">
                </div>
                <div class="form-group">
                    <label>Contacto de Emergencia (Nombre y Tel)</label>
                    <input type="text" name="contactoEmergencia" value="${client ? client.contactoEmergencia : ''}">
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">Guardar</button>
                    <button type="button" class="btn btn-secondary" id="btn-cancel" style="flex: 1;">Cancelar</button>
                </div>
            </form>
        `;

        document.getElementById('btn-cancel').onclick = () => this.showList();
        
        document.getElementById('client-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const clientData = Object.fromEntries(formData.entries());
            
            if (client) {
                Storage.updateClient({ ...client, ...clientData });
            } else {
                Storage.addClient(clientData);
            }
            this.showList();
        };
    },

    viewHistory(clientId) {
        const clients = Storage.getClients();
        const client = clients.find(c => c.id === clientId);
        const consents = Storage.getConsentsByClient(clientId);
        const soaps = Storage.getSoapsByClient(clientId);

        this.container.innerHTML = `
            <div class="header-actions">
                <h2>Historial: ${client.nombre}</h2>
                <button class="btn btn-secondary" id="btn-back">Volver</button>
            </div>

            <h3>Consentimientos</h3>
            <div class="card">
                ${consents.length === 0 ? '<p>No hay consentimientos firmados.</p>' : `
                    <ul class="history-list">
                        ${consents.map(c => `
                            <li class="history-item">
                                <strong>${c.tipo}</strong> - ${new Date(c.date).toLocaleDateString()}
                            </li>
                        `).join('')}
                    </ul>
                `}
            </div>

            <h3>Notas SOAP</h3>
            <div class="card">
                ${soaps.length === 0 ? '<p>No hay notas registradas.</p>' : `
                    <ul class="history-list">
                        ${soaps.map(s => `
                            <li class="history-item">
                                <strong>${new Date(s.createdAt).toLocaleDateString()}</strong> - ${s.duracion} min
                                <p><em>Subjetivo:</em> ${s.subjetivo.queja.substring(0, 50)}...</p>
                            </li>
                        `).join('')}
                    </ul>
                `}
            </div>
        `;

        document.getElementById('btn-back').onclick = () => this.showList();
    }
};
