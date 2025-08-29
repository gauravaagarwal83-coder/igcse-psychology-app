// ... (existing code above unchanged)

function formatContent(content) {
    let html = content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^## (.*)$/gm, '<h3>$1</h3>')
        .replace(/^• (.*)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*?<\/li>)+/gs, match => `<ul>${match}<\/ul>`);
    return html;
}

// ... (rest of code unchanged)