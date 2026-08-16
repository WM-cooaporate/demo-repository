// =========================
// Get Project
// =========================

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

const project = projects.find(function(item) {
    return item.id === projectId;
});

const container = document.getElementById("project-details-container");


// =========================
// Dynamic SEO
// =========================

function updateProjectSEO(project) {

    if (!project) {
        return;
    }

    document.title = project.seoTitle;

    const canonicalUrl =
        `https://wm-cooaporate.github.io/demo-repository/project.html?id=${project.id}`;


    // Description

    let description =
        document.querySelector('meta[name="description"]');

    if (!description) {

        description = document.createElement("meta");

        description.setAttribute(
            "name",
            "description"
        );

        document.head.appendChild(description);
    }

    description.setAttribute(
        "content",
        project.seoDescription
    );


    // Canonical

    let canonical =
        document.querySelector('link[rel="canonical"]');

    if (!canonical) {

        canonical = document.createElement("link");

        canonical.setAttribute(
            "rel",
            "canonical"
        );

        document.head.appendChild(canonical);
    }

    canonical.setAttribute(
        "href",
        canonicalUrl
    );


    // Open Graph

    setMetaProperty(
        "og:title",
        project.seoTitle
    );

    setMetaProperty(
        "og:description",
        project.seoDescription
    );

    setMetaProperty(
        "og:url",
        canonicalUrl
    );


    const imageUrl =
        new URL(
            project.image,
            window.location.href
        ).href;

    setMetaProperty(
        "og:image",
        imageUrl
    );

    setMetaProperty(
        "og:image:alt",
        project.imageAlt
    );


    // Twitter

    setMetaName(
        "twitter:title",
        project.seoTitle
    );

    setMetaName(
        "twitter:description",
        project.seoDescription
    );

    setMetaName(
        "twitter:image",
        imageUrl
    );

    setMetaName(
        "twitter:image:alt",
        project.imageAlt
    );


    // Structured Data

    createProjectSchema(
        project,
        canonicalUrl,
        imageUrl
    );
}


// =========================
// Meta Helpers
// =========================

function setMetaProperty(property, content) {

    let meta =
        document.querySelector(
            `meta[property="${property}"]`
        );

    if (!meta) {

        meta = document.createElement("meta");

        meta.setAttribute(
            "property",
            property
        );

        document.head.appendChild(meta);
    }

    meta.setAttribute(
        "content",
        content
    );
}


function setMetaName(name, content) {

    let meta =
        document.querySelector(
            `meta[name="${name}"]`
        );

    if (!meta) {

        meta = document.createElement("meta");

        meta.setAttribute(
            "name",
            name
        );

        document.head.appendChild(meta);
    }

    meta.setAttribute(
        "content",
        content
    );
}


// =========================
// Structured Data
// =========================

function createProjectSchema(
    project,
    canonicalUrl,
    imageUrl
) {

    const oldSchema =
        document.getElementById(
            "project-schema"
        );

    if (oldSchema) {
        oldSchema.remove();
    }

    const schema =
        document.createElement("script");

    schema.id =
        "project-schema";

    schema.type =
        "application/ld+json";

    const schemaData = {

        "@context": "https://schema.org",

        "@type": "CreativeWork",

        "name": project.title,

        "description": project.seoDescription,

        "url": canonicalUrl,

        "image": imageUrl,

        "creator": {

            "@type": "Organization",

            "name": "WM Solutions",

            "url": "https://wm-cooaporate.github.io/demo-repository/"
        },

        "keywords": project.technologies.join(", "),

        "genre": project.type
    };

    schema.textContent =
        JSON.stringify(schemaData);

    document.head.appendChild(schema);
}


// =========================
// Render Project
// =========================

if (!container) {

    console.error(
        "Project details container not found."
    );

} else if (!project) {

    document.title =
        "Project Not Found | WM Solutions";

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

    // SEO

    updateProjectSEO(project);


    // =========================
    // Main Project Content
    // =========================

    container.innerHTML = `

        <!-- Project Header -->

<div class="project-details-header">

    <p class="project-type">
        ${project.type}
    </p>

    <h1>
        ${project.title}
    </h1>

</div>

        <!-- Main Image -->

        <div class="project-main-image">

            <img
                src="${project.image}"
                alt="${project.imageAlt}"
                width="1100"
                height="500"
                fetchpriority="high"
            >

        </div>


        <!-- Technologies -->

        <section class="project-section project-technologies">

            <h2>
                Technologies Used
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

        </section>


        <!-- Screenshots -->

        <section class="project-section project-screenshots-section">

            <h2>
                Project Screenshots
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
                                    width="350"
                                    height="220"
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

        </section>


        <!-- Video -->

        ${
            project.video !== "#"
                ? `

                    <section class="project-section">

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

                    </section>

                `
                : ""
        }


        <!-- Actions -->

        ${
            project.demo !== "#" ||
            project.github !== "#"
                ? `

                    <div class="project-actions">

                        ${
                            project.demo !== "#"
                                ? `

                                    <a
                                        href="${project.demo}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="btn primary-btn"
                                    >
                                        Live Demo
                                    </a>

                                `
                                : ""
                        }


                        ${
                            project.github !== "#"
                                ? `

                                    <a
                                        href="${project.github}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="btn secondary-btn"
                                    >
                                        GitHub
                                    </a>

                                `
                                : ""
                        }

                    </div>

                `
                : ""
        }

    `;
}


// =========================
// Lightbox
// =========================

const galleryItems =
    document.querySelectorAll(
        ".gallery-item"
    );


const lightbox =
    document.createElement("div");

lightbox.className =
    "lightbox";

lightbox.innerHTML = `

    <button
        class="lightbox-close"
        aria-label="Close image viewer"
    >
        ×
    </button>

    <button
        class="lightbox-prev"
        aria-label="Previous image"
    >
        ‹
    </button>

    <img
        class="lightbox-image"
        src=""
        alt=""
    >

    <button
        class="lightbox-next"
        aria-label="Next image"
    >
        ›
    </button>

`;

document.body.appendChild(
    lightbox
);


const lightboxImage =
    lightbox.querySelector(
        ".lightbox-image"
    );


const closeButton =
    lightbox.querySelector(
        ".lightbox-close"
    );


const prevButton =
    lightbox.querySelector(
        ".lightbox-prev"
    );


const nextButton =
    lightbox.querySelector(
        ".lightbox-next"
    );


let currentImageIndex = 0;


// =========================
// Open Lightbox
// =========================

function openLightbox(index) {

    if (!project) {
        return;
    }

    currentImageIndex =
        index;

    lightboxImage.src =
        project.screenshots[
            currentImageIndex
        ];

    lightboxImage.alt =
        `${project.title} screenshot ${currentImageIndex + 1}`;

    lightbox.classList.add(
        "active"
    );

    document.body.classList.add(
        "lightbox-open"
    );
}


// =========================
// Close Lightbox
// =========================

function closeLightbox() {

    lightbox.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "lightbox-open"
    );
}


// =========================
// Previous Image
// =========================

function showPreviousImage() {

    currentImageIndex--;

    if (
        currentImageIndex < 0
    ) {

        currentImageIndex =
            project.screenshots.length - 1;
    }

    lightboxImage.src =
        project.screenshots[
            currentImageIndex
        ];

    lightboxImage.alt =
        `${project.title} screenshot ${currentImageIndex + 1}`;
}


// =========================
// Next Image
// =========================

function showNextImage() {

    currentImageIndex++;

    if (
        currentImageIndex >=
        project.screenshots.length
    ) {

        currentImageIndex = 0;
    }

    lightboxImage.src =
        project.screenshots[
            currentImageIndex
        ];

    lightboxImage.alt =
        `${project.title} screenshot ${currentImageIndex + 1}`;
}


// =========================
// Gallery Events
// =========================

galleryItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                const index =
                    Number(
                        item.dataset.index
                    );

                openLightbox(index);
            }
        );
    }
);


// =========================
// Lightbox Events
// =========================

closeButton.addEventListener(
    "click",
    closeLightbox
);


prevButton.addEventListener(
    "click",
    showPreviousImage
);


nextButton.addEventListener(
    "click",
    showNextImage
);


lightbox.addEventListener(
    "click",
    function (event) {

        if (
            event.target === lightbox
        ) {

            closeLightbox();
        }
    }
);


// =========================
// Keyboard Controls
// =========================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            !lightbox.classList.contains(
                "active"
            )
        ) {
            return;
        }

        if (
            event.key === "Escape"
        ) {
            closeLightbox();
        }

        if (
            event.key === "ArrowLeft"
        ) {
            showPreviousImage();
        }

        if (
            event.key === "ArrowRight"
        ) {
            showNextImage();
        }
    }
);