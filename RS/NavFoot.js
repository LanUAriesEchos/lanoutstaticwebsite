// Loads the Navbar and footer. Use <div id="navbar-placeholder"></div> to place the navbar into the page
// Use <div id="footer-placeholder"></div> for the footer, Use this at the END OF <BODY> PERFERABLY ONE LINE ABOVE </BODY>!!!!!!
// Load the navbar from the navbar.html file
fetch('RS/nav.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;
    });
    fetch('RS/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    });
