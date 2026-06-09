export const Canvas = {
    init(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // Set canvas size based on display size
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        };

        window.addEventListener('resize', resize);
        resize();

        const startDrawing = (e) => {
            isDrawing = true;
            [lastX, lastY] = this.getCoordinates(e, canvas);
        };

        const draw = (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const [x, y] = this.getCoordinates(e, canvas);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            [lastX, lastY] = [x, y];
        };

        const stopDrawing = () => {
            isDrawing = false;
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        return {
            clear: () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            },
            getDataURL: () => {
                return canvas.toDataURL();
            },
            isEmpty: () => {
                const blank = document.createElement('canvas');
                blank.width = canvas.width;
                blank.height = canvas.height;
                return canvas.toDataURL() === blank.toDataURL();
            }
        };
    },

    getCoordinates(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        return [x, y];
    }
};
