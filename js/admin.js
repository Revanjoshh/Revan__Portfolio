// --- Elements ---
const loginBtn = document.getElementById('loginBtn');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const loginView = document.getElementById('loginView');
const adminDashboardView = document.getElementById('adminDashboardView');

const addProjectTrigger = document.getElementById('addProjectTrigger');
const btnBackToAdmin = document.getElementById('btnBackToAdmin');
const adminMainView = document.getElementById('adminMainView');
const adminFormView = document.getElementById('adminFormView');
const addProjectForm = document.getElementById('addProjectForm');
const projImage = document.getElementById('projImage');
const imageDropzone = document.getElementById('imageDropzone');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const removePreviewBtn = document.getElementById('removePreviewBtn');
const adminToast = document.getElementById('adminToast');
const projDesign = document.getElementById('projDesign');
const linkFieldContainer = document.getElementById('linkFieldContainer');
const projLink = document.getElementById('projLink');

// State
let selectedImageFile = null;
let base64ImageString = ""; // Used if we edit and don't change the image, we keep the old URL
let editingProjectId = null;
let currentProjectOldImage = null; // To know if we need to delete old image from storage

// --- Authentication ---
async function checkAuth() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (data && data.session) {
        showDashboard();
    }
}
checkAuth();

function showDashboard() {
    loginView.style.display = 'none';
    adminDashboardView.style.display = 'block';
    renderAdminProjects();
}

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = adminEmail.value.trim();
        const password = adminPassword.value;

        if (!email || !password) {
            loginError.innerText = "Please enter both email and password.";
            loginError.style.display = 'block';
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = 'Logging in...';

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                loginError.innerText = error.message;
                loginError.style.display = 'block';
            } else {
                loginError.style.display = 'none';
                showDashboard();
            }
        } catch (err) {
            loginError.innerText = "An unexpected error occurred.";
            loginError.style.display = 'block';
            console.error(err);
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Login';
        }
    });
}

const togglePassword = document.getElementById('togglePassword');
if (togglePassword) {
    togglePassword.addEventListener('click', function () {
        const type = adminPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        adminPassword.setAttribute('type', type);
        this.classList.toggle('uil-eye-slash');
    });
}

if (adminPassword) {
    adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
}


// --- Admin Dashboard UI Toggles ---
if (addProjectTrigger) {
    addProjectTrigger.addEventListener('click', () => {
        adminMainView.classList.add('admin__view-hidden');
        adminFormView.classList.remove('admin__view-hidden');
    });
}

if (btnBackToAdmin) {
    btnBackToAdmin.addEventListener('click', () => {
        adminMainView.classList.remove('admin__view-hidden');
        adminFormView.classList.add('admin__view-hidden');
        resetProjectForm();
    });
}

if (projDesign && linkFieldContainer) {
    projDesign.addEventListener('change', () => {
        if (projDesign.value === 'web' || projDesign.value === 'app') {
            linkFieldContainer.classList.remove('admin__view-hidden');
            if (projImage) projImage.required = false;
        } else {
            linkFieldContainer.classList.add('admin__view-hidden');
            if (projLink) projLink.value = '';
            if (projImage) projImage.required = true;
        }
    });
}

// --- Drag & Drop Image Handling ---
if (projImage) {
    projImage.addEventListener('change', function (e) {
        const file = e.target.files[0];
        handleImageFile(file);
    });
}

if (imageDropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
        imageDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            imageDropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        imageDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            imageDropzone.classList.remove('dragover');
        }, false);
    });

    imageDropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        handleImageFile(file);
    });
}

function handleImageFile(file) {
    if (file && file.type.startsWith('image/')) {
        selectedImageFile = file; // Save for Supabase storage upload
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            base64ImageString = reader.result;
            imagePreview.src = base64ImageString;
            imagePreviewContainer.classList.remove('admin__preview-hidden');
        }
    }
}

if (removePreviewBtn) {
    removePreviewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        projImage.value = "";
        selectedImageFile = null;
        base64ImageString = "";
        imagePreview.src = "";
        imagePreviewContainer.classList.add('admin__preview-hidden');
    });
}

function resetProjectForm() {
    addProjectForm.reset();
    projImage.value = "";
    selectedImageFile = null;
    base64ImageString = "";
    imagePreview.src = "";
    imagePreviewContainer.classList.add('admin__preview-hidden');
    if (linkFieldContainer) linkFieldContainer.classList.add('admin__view-hidden');

    editingProjectId = null;
    currentProjectOldImage = null;
    if (projImage) projImage.required = false;

    const formTitle = document.querySelector('#adminFormView .admin__box-title');
    if (formTitle) formTitle.innerText = "Add New Project";

    const submitBtn = document.querySelector('#addProjectForm button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = 'Add Project';
}

// --- Form Submission (Supabase Database & Storage) ---
if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.querySelector('#addProjectForm button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Saving...';

        const name = document.getElementById('projName').value.trim();
        const category = document.getElementById('projDesign').value;
        const description = document.getElementById('projDesc').value.trim();
        const link = (category === 'web' || category === 'app') ? document.getElementById('projLink').value.trim() : '';

        // Validation: Graphic Design always requires an image. Web/App can use screenshot fallback.
        if (category === 'design' && !selectedImageFile && !base64ImageString && !currentProjectOldImage) {
            alert("Please upload a project image for Graphic Design projects!");
            submitBtn.disabled = false;
            submitBtn.innerHTML = editingProjectId ? 'Save Changes' : 'Add Project';
            return;
        }

        let imageUrl = base64ImageString || currentProjectOldImage;

        // Generate automatic screenshot for Web/App if no image was provided
        if (!selectedImageFile && !base64ImageString && !currentProjectOldImage && (category === 'web' || category === 'app')) {
            if (link) {
                // Use Automattic's mshots to generate a live screenshot of the URL (completely free, no API key needed)
                imageUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(link)}?w=1200`;
            } else {
                // Fallback image if no link and no image is uploaded
                imageUrl = 'assets/img/dumrev.png';
            }
        }

        try {
            // Upload new image to Supabase Storage if one was selected
            if (selectedImageFile) {
                const fileExt = selectedImageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `projects/${fileName}`;

                const { error: uploadError, data } = await supabaseClient.storage
                    .from('portfolio-images')
                    .upload(filePath, selectedImageFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabaseClient.storage
                    .from('portfolio-images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrlData.publicUrl;

                // Delete old image if we are replacing it
                if (editingProjectId && currentProjectOldImage && currentProjectOldImage.includes('portfolio-images/projects/')) {
                    const oldPath = currentProjectOldImage.split('portfolio-images/')[1];
                    await supabaseClient.storage.from('portfolio-images').remove([oldPath]);
                }
            }

            // Database Insert or Update
            if (editingProjectId !== null) {
                // Update
                const { error: dbError } = await supabaseClient.from('projects').update({
                    name: name,
                    category: category,
                    image: imageUrl,
                    description: description,
                    link: link
                }).eq('id', editingProjectId);

                if (dbError) throw dbError;
                document.querySelector('.admin__toast-msg').innerText = "Project updated successfully!";
            } else {
                // Insert
                const { error: dbError } = await supabaseClient.from('projects').insert([{
                    name: name,
                    category: category,
                    image: imageUrl,
                    description: description,
                    link: link
                }]);

                if (dbError) throw dbError;
                document.querySelector('.admin__toast-msg').innerText = "Project added successfully!";
            }

            renderAdminProjects();
            showSuccessToast();
            btnBackToAdmin.click();

        } catch (error) {
            console.error("Error saving project:", error);
            alert("Error saving project: " + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = editingProjectId ? 'Save Changes' : 'Add Project';
        }
    });
}

function showSuccessToast() {
    adminToast.classList.add('toast-active');
    setTimeout(() => {
        adminToast.classList.remove('toast-active');
    }, 3000);
}

// --- Fetch and Render Projects ---
async function renderAdminProjects() {
    const adminProjectsList = document.getElementById('adminProjectsList');
    if (!adminProjectsList) return;

    adminProjectsList.innerHTML = '<p>Loading projects...</p>';

    const { data: customProjects, error } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching projects:", error);
        adminProjectsList.innerHTML = '<p class="admin__no-projects">Failed to load projects.</p>';
        return;
    }

    if (!customProjects || customProjects.length === 0) {
        adminProjectsList.innerHTML = '<p class="admin__no-projects">No projects added yet.</p>';
        return;
    }

    let html = '';
    customProjects.forEach(project => {
        html += `
            <div class="admin__project-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 0.5rem; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; column-gap: 1rem;">
                    <img src="${project.image}" alt="${project.name}" class="admin__project-img" style="width: 50px; height: 50px; object-fit: cover; border-radius: 0.25rem;">
                    <div class="admin__project-info">
                        <h4 class="admin__project-name" style="margin: 0; font-size: var(--normal-font-size);">${project.name}</h4>
                        <span class="admin__project-cat" style="font-size: var(--small-font-size); color: var(--text-color-light);">${project.category}</span>
                    </div>
                </div>
                <div class="admin__project-actions" style="display: flex; column-gap: 0.5rem;">
                    <button class="admin__action-btn edit-btn" data-id="${project.id}" title="Edit Project" style="background: none; border: none; color: var(--text-color); cursor: pointer; font-size: 1.25rem;">
                        <i class="uil uil-edit"></i>
                    </button>
                    <button class="admin__action-btn delete-btn" data-id="${project.id}" data-img="${project.image}" title="Delete Project" style="background: none; border: none; color: #ff5e5e; cursor: pointer; font-size: 1.25rem;">
                        <i class="uil uil-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });

    adminProjectsList.innerHTML = html;

    document.querySelectorAll('.admin__action-btn.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            editProject(id);
        });
    });

    document.querySelectorAll('.admin__action-btn.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const imgUrl = e.currentTarget.getAttribute('data-img');
            deleteProject(id, imgUrl);
        });
    });
}

async function deleteProject(id, imgUrl) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            // Delete from Database
            const { error: dbError } = await supabaseClient.from('projects').delete().eq('id', id);
            if (dbError) throw dbError;

            // Delete from Storage if it's a Supabase hosted image
            if (imgUrl && imgUrl.includes('portfolio-images/projects/')) {
                const oldPath = imgUrl.split('portfolio-images/')[1];
                await supabaseClient.storage.from('portfolio-images').remove([oldPath]);
            }

            renderAdminProjects();
        } catch (err) {
            console.error("Failed to delete project:", err);
            alert("Error deleting project.");
        }
    }
}

async function editProject(id) {
    const { data: project, error } = await supabaseClient.from('projects').select('*').eq('id', id).single();

    if (error || !project) {
        alert("Could not load project for editing");
        return;
    }

    editingProjectId = project.id;
    currentProjectOldImage = project.image;

    document.getElementById('projName').value = project.name;
    document.getElementById('projDesign').value = project.category;
    document.getElementById('projDesc').value = project.description;

    if (project.category === 'web' || project.category === 'app') {
        linkFieldContainer.classList.remove('admin__view-hidden');
        if (project.link) {
            document.getElementById('projLink').value = project.link;
        }
    } else {
        linkFieldContainer.classList.add('admin__view-hidden');
    }

    base64ImageString = project.image;
    imagePreview.src = base64ImageString;
    imagePreviewContainer.classList.remove('admin__preview-hidden');
    projImage.required = false;

    const formTitle = document.querySelector('#adminFormView .admin__box-title');
    if (formTitle) formTitle.innerText = "Edit Project";

    const submitBtn = document.querySelector('#addProjectForm button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = 'Save Changes';

    adminMainView.classList.add('admin__view-hidden');
    adminFormView.classList.remove('admin__view-hidden');
}

