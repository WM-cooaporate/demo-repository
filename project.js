// =========================
// Project Details
// =========================


const params =
    new URLSearchParams(
        window.location.search
    );


const projectId =
    params.get("id");


const project =
    projects.find(function(item) {

        return item.id === projectId;

    });


const container =
    document.getElementById(
        "project-details-container"
    );


if (!container) {

    console.error(
        "Project details container not found."
    );

} else if (!project) {

    container.innerHTML = `

        <div class="project-not-found">

            <h1>
                Project Not Found
            </h1>


            <p>
                Sorry, this project does not exist.
            </p>


            <a href="index.html#projects">
                Back to Projects
            </a>

        </div>

    `;

} else {

    container.innerHTML = `

        <!-- Project Header -->

        <div class="project-details-header">

            <p class="project-type">
                ${project.type}
            </p>


            <h1>
                ${project.title}
            </h1>


            <p class="project-description">
                ${project.description}
            </p>

        </div>



        <!-- Main Image -->

        <div class="project-main-image">

            <img
                src="${project.image}"
                alt="${project.title}"
            >

        </div>



        <!-- Technologies -->

        <div class="project-section">

            <h2>
                Technologies
            </h2>


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

        </div>


<!-- Screenshots -->

<div class="project-section">

    <h2>
        Screenshots
    </h2>

    <div class="project-gallery">

        ${project.screenshots
            .map(function (image, index) {

                return `
                    <div
                        class="gallery-item"
                        data-index="${index}"
                    >

                        <img
                            src="${image}"
                            alt="${project.title} screenshot ${index + 1}"
                            loading="lazy"
                        >

                        <div class="gallery-overlay">
                            Click to View
                        </div>

                    </div>
                `;

            })
            .join("")
        }

    </div>

</div>



        <!-- Demo Video -->

        <div class="project-section">

            <h2>
                Project Demo
            </h2>


            <div class="project-video">

                <video
                    controls
                    preload="metadata"
                    playsinline
                >

                    <source
                        src="${project.video}"
                        type="video/mp4"
                    >

                    Your browser does not support
                    video playback.

                </video>

            </div>

        </div>



        <!-- Project Links -->

        <div class="project-actions">

            <a
                href="${project.demo}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn primary-btn"
            >
                Live Demo
            </a>


            <a
                href="${project.github}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn secondary-btn"
            >
                GitHub
            </a>

        </div>

    `;

}
// =========================
// Image Lightbox
// =========================

const galleryItems =
    document.querySelectorAll(".gallery-item");


// Create Lightbox
const lightbox =
    document.createElement("div");

lightbox.className = "lightbox";

lightbox.innerHTML = `

    <button class="lightbox-close">
        ×
    </button>

    <button class="lightbox-prev">
        ‹
    </button>

    <img
        class="lightbox-image"
        src=""
        alt=""
    >

    <button class="lightbox-next">
        ›
    </button>

`;

document.body.appendChild(lightbox);


// Elements

const lightboxImage =
    lightbox.querySelector(".lightbox-image");

const closeButton =
    lightbox.querySelector(".lightbox-close");

const prevButton =
    lightbox.querySelector(".lightbox-prev");

const nextButton =
    lightbox.querySelector(".lightbox-next");


let currentImageIndex = 0;


// Open Lightbox

function openLightbox(index) {

    currentImageIndex = index;

    lightboxImage.src =
        project.screenshots[currentImageIndex];

    lightboxImage.alt =
        `${project.title} screenshot ${currentImageIndex + 1}`;

    lightbox.classList.add("active");

    document.body.classList.add("lightbox-open");

}


// Close Lightbox

function closeLightbox() {

    lightbox.classList.remove("active");

    document.body.classList.remove("lightbox-open");

}


// Show Previous Image

function showPreviousImage() {

    currentImageIndex--;

    if (currentImageIndex < 0) {

        currentImageIndex =
            project.screenshots.length - 1;

    }

    lightboxImage.src =
        project.screenshots[currentImageIndex];

}


// Show Next Image

function showNextImage() {

    currentImageIndex++;

    if (
        currentImageIndex >=
        project.screenshots.length
    ) {

        currentImageIndex = 0;

    }

    lightboxImage.src =
        project.screenshots[currentImageIndex];

}


// Click Gallery Image

galleryItems.forEach(function (item) {

    item.addEventListener("click", function () {

        const index =
            Number(item.dataset.index);

        openLightbox(index);

    });

});


// Close Button

closeButton.addEventListener(
    "click",
    closeLightbox
);


// Previous

prevButton.addEventListener(
    "click",
    showPreviousImage
);


// Next

nextButton.addEventListener(
    "click",
    showNextImage
);


// Click Outside Image

lightbox.addEventListener(
    "click",
    function (event) {

        if (event.target === lightbox) {

            closeLightbox();

        }

    }
);


// Keyboard Controls

document.addEventListener(
    "keydown",
    function (event) {

        if (
            !lightbox.classList.contains("active")
        ) {

            return;

        }


        if (event.key === "Escape") {

            closeLightbox();

        }


        if (event.key === "ArrowLeft") {

            showPreviousImage();

        }


        if (event.key === "ArrowRight") {

            showNextImage();

        }

    }
);