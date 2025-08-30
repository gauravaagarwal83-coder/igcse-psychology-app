// Test the formatContent function
function formatContent(content) {
    return content
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^## (.*$)/gm, '<h3>$1</h3>')
        .replace(/^• (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>')
        .replace(/<br><h3>/g, '<h3>')
        .replace(/<br><ul>/g, '<ul>')
        .replace(/<\/ul><br>/g, '</ul><br>');
}

// Test card 1 (has markdown)
const card1 = "## 🧠 Brain Structure Formation\n\n**Think of the brain like building a house:**\n• **Week 3-4:** Foundation laid";

// Test card 3 (plain text)
const card3 = "**Core Concepts:** Children actively adapt to their world through building mental schemas";

console.log("Card 1 (markdown):");
console.log(formatContent(card1));
console.log("\nCard 3 (plain text):");
console.log(formatContent(card3));