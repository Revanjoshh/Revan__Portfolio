/*=============== SHOW SIDEBAR ===============*/
const navMenu = document.getElementById('side-bar'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close'),
    navLink = document.querySelectorAll('.nav__link');

/*===== SIDEBAR SHOW =====*/
/* Validate If Constant Exists */
if (navToggle) {
    navToggle.addEventListener("click", () => {
        navMenu.classList.add('show-sidebar');
    })
}

/*===== SIDEBAR HIDDEN =====*/
/* Validate If Constant Exists */
if (navClose) {
    navClose.addEventListener("click", () => {
        navMenu.classList.remove('show-sidebar');
    })
}
navLink.forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove('show-sidebar');
    });
});

/*=============== SKILLS TABS ===============*/
const tabs = document.querySelectorAll("[data-target"),
    tabcontent = document.querySelectorAll('[data-content');

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const target = document.querySelector(tab.dataset.target);

        tabcontent.forEach(tabcontents => {
            tabcontents.classList.remove("skills__active")
        })
        target.classList.add("skills__active")

        tabs.forEach(tab => {
            tab.classList.remove("skills__active")
        })
        tab.classList.add("skills__active")
    })
})

/*===== LOAD CUSTOM PROJECTS FROM SUPABASE =====*/
async function loadCustomProjects() {
    const isHomePage = document.getElementById('web-projects-container') !== null;
    const isProjectsPage = document.querySelector('.work__filters') !== null;
    
    document.querySelectorAll('.custom-project-card').forEach(card => card.remove());

    try {
        // We order by id descending to get the newest projects first
        const { data: customProjects, error } = await supabaseClient.from('projects').select('*').order('id', { ascending: false });
        if (error) throw error;

        if (customProjects) {
            if (isHomePage) {
                const webContainer = document.getElementById('web-projects-container');
                const designContainer = document.getElementById('design-projects-container');
                
                if(webContainer) webContainer.innerHTML = '';
                if(designContainer) designContainer.innerHTML = '';

                let webCount = 0;
                let designCount = 0;

                customProjects.forEach(project => {
                    const projectCard = generateProjectCard(project);
                    
                    const catString = (project.category || '').toLowerCase();
                    const isWeb = catString.includes('web');
                    const isDesign = catString.includes('design') || catString.includes('graphic');

                    if (isWeb && webCount < 6 && webContainer) {
                        webContainer.insertAdjacentHTML('beforeend', projectCard);
                        webCount++;
                    } else if (isDesign && designCount < 6 && designContainer) {
                        designContainer.insertAdjacentHTML('beforeend', projectCard);
                        designCount++;
                    }
                });
            } else if (isProjectsPage) {
                const container = document.querySelector('.work__container');
                if (container) {
                    container.innerHTML = ''; 
                    
                    const designProjects = [];
                    const webProjects = [];
                    
                    customProjects.forEach(project => {
                        const catStr = (project.category || '').toLowerCase();
                        if (catStr.includes('design') || catStr.includes('graphic')) {
                            designProjects.push(project);
                        } else {
                            webProjects.push(project);
                        }
                    });
                    
                    if (designProjects.length > 0) {
                        container.insertAdjacentHTML('beforeend', `<h3 class="mix design category-heading" style="grid-column: 1 / -1; margin-top: 1rem; font-size: var(--h3-font-size); color: var(--title-color); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; width: 100%;">Graphic Design</h3>`);
                        designProjects.forEach(p => container.insertAdjacentHTML('beforeend', generateProjectCard(p)));
                    }
                    
                    if (webProjects.length > 0) {
                        container.insertAdjacentHTML('beforeend', `<h3 class="mix web category-heading" style="grid-column: 1 / -1; margin-top: 1rem; font-size: var(--h3-font-size); color: var(--title-color); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; width: 100%;">Web Development</h3>`);
                        webProjects.forEach(p => container.insertAdjacentHTML('beforeend', generateProjectCard(p)));
                    }

                    /*=============== MIXITUP FILTER PORTFOLIO ===============*/
                    if (typeof mixitup !== 'undefined') {
                        if (window.mixerPortfolio) {
                            window.mixerPortfolio.destroy();
                        }
                        window.mixerPortfolio = mixitup('.work__container', {
                            selectors: { target: '.mix' },
                            animation: { duration: 300 }
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error loading projects from Supabase:", err);
    }
}

function generateProjectCard(project) {
    let catClass = 'web';
    const catStr = (project.category || '').toLowerCase();
    if(catStr.includes('design') || catStr.includes('graphic')) {
        catClass = 'design';
    }

    // Include the category in the details so the modal can read it
    return `
        <div class="work__card mix ${catClass} custom-project-card" data-id="${project.id}">
            <img src="${project.image}" alt="${project.name}" class="work__img">
            <h3 class="work__title">${project.name}</h3>
            <span class="work__button">View Project
                <i class="uil uil-arrow-right work__button-icon"></i>
            </span>
            <div class="portfolio__item-details" style="display: none;">
                <h3 class="details__title">${project.name}</h3>
                <p class="detail__description">${project.description || ''}</p>
                <div class="detail__category" style="display:none;">${project.category || ''}</div>
                ${project.link ? `
                <ul class="detail__info">
                    <li>Link - <span><a href="${project.link}" target="_blank">${project.link}</a></span></li>
                </ul>
                ` : ''}
            </div>
        </div>
    `;
}

// Load dynamic custom projects and initialize MixItUp
loadCustomProjects();

/*===== Link Active Work =====*/
const linkWork = document.querySelectorAll('.work__item');

function activeWork() {
    linkWork.forEach(x => x.classList.remove('active-work'))
    this.classList.add('active-work')
}
linkWork.forEach(x => x.addEventListener("click", activeWork))

/*===== Work Popup =====*/
document.addEventListener("click", (e) => {
    const card = e.target.closest('.work__card');
    if (card) {
        togglePortfolioPopup();
        portfolioItemDetails(card);
    }
})

function togglePortfolioPopup() {
    document.querySelector(".portfolio__popup").classList.toggle("open");
    document.body.classList.toggle("no-scroll");
}
const portfolioPopupClose = document.querySelector('.portfolio__popup-close');
if(portfolioPopupClose) {
    portfolioPopupClose.addEventListener("click", togglePortfolioPopup);
}

function portfolioItemDetails(portfolioItem) {
    document.querySelector(".pp__thumbnail img").src = portfolioItem.querySelector(".work__img").src;
    const catElement = portfolioItem.querySelector(".detail__category");
    const categoryText = catElement ? catElement.textContent : 'Project';
    document.querySelector(".portfolio__popup-subtitle span").innerHTML = categoryText;
    document.querySelector(".portfolio__popup-body").innerHTML = portfolioItem.querySelector(".portfolio__item-details").innerHTML;
}

/*=============== SERVICES MODAL ===============*/
const modalViews = document.querySelectorAll(".services__modal"),
    modalBtns = document.querySelectorAll(".services__button"),
    modalCloses = document.querySelectorAll(".services__modal-close");

/*  modal függvény létrehozása */
let modal = function (modalClick) {
    modalViews[modalClick].classList.add("active-modal");
    document.body.classList.add("no-scroll");

    modalViews[modalClick].addEventListener("click", function (e) {
        if (e.target === this) {
            closeModal(modalClick);
        }
    });
};

/* a closeModal függvény létrehozása */
let closeModal = function (modalClick) {
    modalViews[modalClick].classList.remove("active-modal");
    document.body.classList.remove("no-scroll");
}

modalBtns.forEach((modalBtn, i) => {
    modalBtn.addEventListener('click', () => {
        modal(i);
    })
})

modalCloses.forEach((modalClose, i) => {
    modalClose.addEventListener("click", () => {
        closeModal(i);
    });
});

/*=============== SWIPER TESTIMONIAL ===============*/
let swiper = new Swiper(".testimonials__container", {
    spaceBetween: 24,
    loop: true,
    grabCursor: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    breakpoints: {
        567: {
            slidesPerView: 2,
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 48,
        },
    }
});

/*=============== INPUT ANIMATION ===============*/
const inputs = document.querySelectorAll(".input");

function focusFunc() {
    let parent = this.parentNode;
    parent.classList.add('focus');
}

function blurFunc() {
    let parent = this.parentNode;
    if (this.value == "") {
        parent.classList.remove('focus');
    }
}

inputs.forEach((input) => {
    input.addEventListener("focus", focusFunc);
    input.addEventListener("blur", blurFunc);
})

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', navHighlighter);

function navHighlighter() {
    let scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 30,
            sectionId = current.getAttribute('id');

        let link = document.querySelector('.nav__menu a[href*=' + sectionId + ']');
        
        // Special case for the Work (Projects) section, since its href is 'projects.html'
        if (!link && sectionId === 'work') {
            link = document.querySelector('.nav__menu a[href*="projects.html"]');
        }

        if (link) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link');
            }
        }
    })
}

/*=============== SHOW SCROLL UP ===============*/

/*=============== CONTACT FORM SUBMISSION (Direct mailto) ===============*/
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const contactStatus = document.getElementById('contactStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Stop default browser refresh

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phoneElem = document.getElementById('phone');
        const phone = phoneElem ? phoneElem.value.trim() : '';
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) return;

        // Visual loading state on button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending... <i class="uil uil-spinner alt spin"></i>';
        }
        if (contactStatus) {
            contactStatus.className = 'contact__status';
            contactStatus.textContent = '';
        }

        const formData = {
            name: name,
            email: email,
            phone: phone,
            message: message,
            _subject: `New Portfolio Message from ${name}`,
            _template: 'table'
        };

        try {
            // Direct submission to revanjoshh@gmail.com via FormSubmit AJAX endpoint
            const response = await fetch('https://formsubmit.co/ajax/revanjoshh@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                if (contactStatus) {
                    contactStatus.className = 'contact__status success';
                    contactStatus.textContent = '✓ Your message has been sent to revanjoshh@gmail.com!';
                }
                contactForm.reset();

                // Reset floating label styling
                const inputContainers = document.querySelectorAll('.input__container');
                inputContainers.forEach(container => container.classList.remove('focus'));
            } else {
                throw new Error('Server returned an error');
            }
        } catch (err) {
            // Backup fallback: trigger native mailto if network/AJAX fails
            console.warn('FormSubmit AJAX failed, falling back to mailto:', err);

            const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
            const body = encodeURIComponent(
                `Hi Revan,\n\nYou have received a new contact message:\n\n` +
                `Name: ${name}\n` +
                `Email: ${email}\n` +
                `Phone: ${phone}\n\n` +
                `Message:\n${message}\n\n` +
                `Best regards,\n${name}`
            );

            window.location.href = `mailto:revanjoshh@gmail.com?subject=${subject}&body=${body}`;

            if (contactStatus) {
                contactStatus.className = 'contact__status success';
                contactStatus.textContent = '✓ Opening email client to send message...';
            }
            contactForm.reset();
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message <i class="uil uil-message button__icon"></i>';
            }
        }
    });
}

/*=============== MESSENGER CARD CLICK (Opens/Focuses Contact Form) ===============*/
const messengerCard = document.getElementById('messengerCard');
if (messengerCard) {
    messengerCard.addEventListener('click', function () {
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.focus();
            nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}


/*=============== PROJECTS CAROUSEL MODAL LOGIC ===============*/
const projectsModal = document.getElementById('projectsModal'),
    projectsBtn = document.getElementById('projectsBtn'),
    projectsFooterBtn = document.getElementById('projectsFooterBtn'),
    closeProjectsModal = document.getElementById('closeProjectsModal');

// Open Projects Modal from Sidebar
if (projectsBtn) {
    projectsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (projectsModal) {
            projectsModal.classList.add('active-modal');
            populateProjectsCarousel();
        }
    });
}

// Open Projects Modal from Footer
if (projectsFooterBtn) {
    projectsFooterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (projectsModal) {
            projectsModal.classList.add('active-modal');
            populateProjectsCarousel();
        }
    });
}

// Close Projects Modal
if (closeProjectsModal) {
    closeProjectsModal.addEventListener('click', () => {
        if (projectsModal) projectsModal.classList.remove('active-modal');
    });
}

if (projectsModal) {
    projectsModal.addEventListener('click', function (e) {
        if (e.target === this) {
            projectsModal.classList.remove('active-modal');
        }
    });
}

// Populates and Initializes Swiper Projects Slider
function populateProjectsCarousel() {
    const slidesWrapper = document.querySelector('#projectsModal .swiper-wrapper');
    if (!slidesWrapper) return;

    slidesWrapper.innerHTML = ''; // Clear previous slides

    // Gather all currently loaded project cards
    const cards = document.querySelectorAll('.work__container .work__card');

    cards.forEach(card => {
        const imgElement = card.querySelector('.work__img');
        const titleElement = card.querySelector('.work__title');
        
        if (!imgElement || !titleElement) return;

        const img = imgElement.src;
        const title = titleElement.innerText;

        // Get details if available
        const details = card.querySelector('.portfolio__item-details');
        const desc = details ? details.querySelector('.detail__description').innerText : 'No project description details are available for this portfolio piece.';
        const linkElement = details ? details.querySelector('.detail__info a') : null;
        const link = linkElement ? linkElement.href : null;

        const slideHTML = `
            <div class="swiper-slide">
                <div class="work__card" style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 0.75rem; background-color: rgba(255, 255, 255, 0.01);">
                    <div>
                        <img src="${img}" alt="${title}" class="work__img" style="border-radius: 0.5rem; margin-bottom: 1rem; width: 100%; height: 180px; object-fit: contain; background-color: rgba(255, 255, 255, 0.02);">
                        <h3 class="work__title" style="font-size: var(--normal-font-size); margin-bottom: 0.5rem; text-align: left;">${title}</h3>
                        <p style="font-size: var(--smaller-font-size); color: var(--text-color); margin-bottom: 1rem; line-height: 1.5; text-align: left; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${desc}</p>
                    </div>
                    ${link ? `
                    <a href="${link}" target="_blank" class="button" style="padding: 0.6rem 1rem; font-size: var(--small-font-size); display: inline-flex; justify-content: center; column-gap: 0.25rem; align-items: center; width: 100%;">
                        <i class="uil uil-external-link-alt"></i> View Demo
                    </a>
                    ` : ''}
                </div>
            </div>
        `;
        slidesWrapper.insertAdjacentHTML('beforeend', slideHTML);
    });

    // Initialize/Update Swiper Slider
    if (window.projectsSwiper) {
        window.projectsSwiper.update();
    } else {
        window.projectsSwiper = new Swiper('.projects__slider', {
            spaceBetween: 24,
            grabCursor: true,
            pagination: {
                el: '#projectsModal .swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '#projectsModal .swiper-button-next',
                prevEl: '#projectsModal .swiper-button-prev',
            },
            breakpoints: {
                0: {
                    slidesPerView: 1,
                },
                576: {
                    slidesPerView: 2,
                },
                992: {
                    slidesPerView: 3,
                }
            }
        });
    }
}

/*=============== WEB SHARE API ===============*/
const shareBtns = document.querySelectorAll('.btn__share');
shareBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Revan Portfolio',
                    text: 'Check out this awesome portfolio by Frontend Developer & UI/UX Designer, Revan Josh!',
                    url: window.location.href
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(window.location.href);
            alert('Portfolio link copied to clipboard!');
        }
    });
});


