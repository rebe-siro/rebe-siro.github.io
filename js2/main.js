document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Ir a buscar el header y meterlo en su contenedor
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
        })
        .catch(error => console.error("Error cargando el header:", error));

    // 2. Ir a buscar el footer y meterlo en su contenedor
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-container").innerHTML = data;
        })
        .catch(error => console.error("Error cargando el footer:", error));

});