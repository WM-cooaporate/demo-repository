document.documentElement.classList.add("js-enabled");


// =========================
// Mobile Menu
// =========================

const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", function() {

        navLinks.classList.toggle("active");

    });


    const links = navLinks.querySelectorAll("a");

    links.forEach(function(link) {

        link.addEventListener("click", function() {

            navLinks.classList.remove("active");

        });

    });

}


// =========================
// Contact Form
// =========================

const contactForm =
    document.querySelector(".contact-form form");

if (contactForm) {

    contactForm.addEventListener("submit", function(event) {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const message =
            document.getElementById("message").value.trim();


        if (name === "") {

            alert("Please enter your name.");

            return;

        }


        if (email === "") {

            alert("Please enter your email.");

            return;

        }


        if (!email.includes("@")) {

            alert("Please enter a valid email.");

            return;

        }


        if (message === "") {

            alert("Please enter your message.");

            return;

        }


        alert(
            "Thank you! Your message is ready to be sent."
        );


        contactForm.reset();

    });

}


// =========================
// Projects
// =========================

const projectsContainer =
    document.getElementById("projects-container");


if (projectsContainer && typeof projects !== "undefined") {

    projects.forEach(function(project) {

                const projectCard =
                    document.createElement("div");


                projectCard.classList.add("project-card");


                projectCard.innerHTML = `

            <div class="project-image">

                <img
                    src="${project.image}"
                    alt="${project.title}"
                >

            </div>


            <div class="project-content">

                <p class="project-type">
                    ${project.type}
                </p>


                <h3>
                    ${project.title}
                </h3>


                <p>
                    ${project.description}
                </p>


                <div class="project-tech">

                    ${project.technologies
                        .map(function (technology) {

                            return `
                                <span>
                                    ${technology}
                                </span>
                            `;

                        })
                        .join("")
                    }

                </div>


                <div class="project-buttons">

                    <a
                        href="./project.html?id=${project.id}"
                        class="project-link"
                    >
                        View Project →
                    </a>


                    <a
                        href="${project.github}"
                        class="project-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub →
                    </a>

                </div>

            </div>

        `;


        projectsContainer.appendChild(projectCard);

    });

}


// =========================
// Scroll Animation
// =========================

const observer =
    new IntersectionObserver(

        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                }

            });

        },

        {
            threshold: 0.15
        }

    );


function observeAnimatedElements() {

    const animatedElements =
        document.querySelectorAll(
            ".service-card, .project-card, .team-card, .contact-form, .contact-info"
        );


    animatedElements.forEach(function (element) {

        observer.observe(element);

    });

}


observeAnimatedElements();


// =========================
// Active Navigation Link
// =========================

const sections =
    document.querySelectorAll("section");


const navItems =
    document.querySelectorAll(".nav-links a");


window.addEventListener("scroll", function () {

    let currentSection = "";


    sections.forEach(function (section) {

        const sectionTop =
            section.offsetTop - 150;


        const sectionHeight =
            section.offsetHeight;


        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {

            currentSection =
                section.getAttribute("id");

        }

    });


    navItems.forEach(function (link) {

        link.classList.remove("active-link");


        if (
            link.getAttribute("href") ===
            `#${currentSection}`
        ) {

            link.classList.add("active-link");

        }

    });

});


// =========================
// Back To Top
// =========================

const backToTop =
    document.getElementById("back-to-top");


if (backToTop) {

    window.addEventListener("scroll", function () {

        if (window.scrollY > 500) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    });


    backToTop.addEventListener("click", function () {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}