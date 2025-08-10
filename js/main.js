document.addEventListener('DOMContentLoaded', function() {
    console.log('澤暘建設網站已載入');
});

window.addEventListener('resize', function() {
    const viewportHeight = window.innerHeight;
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.height = `${viewportHeight}px`;
    }
});