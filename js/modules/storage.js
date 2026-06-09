export const Storage = {
    initDefaults() {
        if (!this.get('therapist_config')) {
            this.save('therapist_config', {
                nombre: 'Giacinto Schiavone',
                whatsapp: '18326878443',
                email: 'Gspunto@gmail.com'
            });
        }
    },
    
    save(key, data) {
        localStorage.setItem(`zenterapeuta_${key}`, JSON.stringify(data));
    },

    get(key) {
        const data = localStorage.getItem(`zenterapeuta_${key}`);
        return data ? JSON.parse(data) : null;
    },

    // Clientes
    getClients() {
        return this.get('clients') || [];
    },

    saveClients(clients) {
        this.save('clients', clients);
    },

    addClient(client) {
        const clients = this.getClients();
        client.id = Date.now().toString();
        client.createdAt = new Date().toISOString();
        clients.push(client);
        this.saveClients(clients);
        return client;
    },

    updateClient(updatedClient) {
        const clients = this.getClients();
        const index = clients.findIndex(c => c.id === updatedClient.id);
        if (index !== -1) {
            clients[index] = { ...clients[index], ...updatedClient };
            this.saveClients(clients);
        }
    },

    deleteClient(id) {
        const clients = this.getClients().filter(c => c.id !== id);
        this.saveClients(clients);
        // Also cleanup related data?
        const consents = this.getAllConsents().filter(c => c.clientId !== id);
        this.save('consents', consents);
        const soaps = this.getAllSoaps().filter(s => s.clientId !== id);
        this.save('soaps', soaps);
    },

    // Consents
    getAllConsents() {
        return this.get('consents') || [];
    },

    getConsentsByClient(clientId) {
        return this.getAllConsents().filter(c => c.clientId === clientId);
    },

    addConsent(consent) {
        const consents = this.getAllConsents();
        consent.id = Date.now().toString();
        consent.date = new Date().toISOString();
        consents.push(consent);
        this.save('consents', consents);
        return consent;
    },

    // SOAP Notes
    getAllSoaps() {
        return this.get('soaps') || [];
    },

    getSoapsByClient(clientId) {
        return this.getAllSoaps().filter(s => s.clientId === clientId);
    },

    addSoap(soap) {
        const soaps = this.getAllSoaps();
        soap.id = Date.now().toString();
        soap.createdAt = new Date().toISOString();
        soaps.push(soap);
        this.save('soaps', soaps);
        return soap;
    },

    // Settings
    getTherapistSignature() {
        return localStorage.getItem('zenterapeuta_therapist_sig');
    },

    saveTherapistSignature(sig) {
        localStorage.setItem('zenterapeuta_therapist_sig', sig);
    }
};
