/* ==========================================================================
   INFINITY ATELIER — PORTFOLIO MASONRY & DETAIL DRAWER CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPortfolioGrid();
  initPortfolioFilters();
  initPortfolioModal();
  initMobileDrawer();
  initWhatsAppPulse();
});

// Map project IDs to specific filter subcategories
const PROJECT_FILTERS = {
  living: [4, 5, 12, 17],
  bedroom: [3, 11, 14, 15],
  bathroom: [8, 9, 18],
  kitchen: [1, 2, 10, 16],
  commercial: [6, 7, 13],
  process: [3, 11, 15] // Highlight architectural plaster nodes, study setups, and custom joinery
};

/* --------------------------------------------------------------------------
   1. Build Portfolio Grid
   -------------------------------------------------------------------------- */
function initPortfolioGrid() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid || typeof PROJECTS_METADATA === 'undefined') return;

  grid.innerHTML = '';

  PROJECTS_METADATA.forEach(project => {
    const item = document.createElement('div');
    item.className = 'portfolio-item';
    item.setAttribute('data-id', project.id);
    
    // Construct subcategories string for filtering convenience
    let filtersStr = '';
    for (const [filterName, ids] of Object.entries(PROJECT_FILTERS)) {
      if (ids.includes(project.id)) {
        filtersStr += ` filter-${filterName}`;
      }
    }
    item.setAttribute('data-filters', filtersStr.trim());

    item.innerHTML = `
      <div class="blur-load" style="background-image: url('${project.blur_placeholder}');">
        <img class="lazy" src="data:image/webp;base64,UklGRj4AAABXRUJQVlA4TDEAAAAvD8ADED8HIwAS/f8DREcCIoAIoAAY3d508u/0yU0XQ18VjP7/FkQEEDAAGD39vXf5Ww4=" 
             data-src="${project.path_800}" 
             data-srcset="${project.path_400} 400w, ${project.path_800} 800w, ${project.path_1200} 1200w" 
             sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
             alt="${project.title}" loading="lazy">
      </div>
      <div class="portfolio-overlay">
        <div class="portfolio-overlay-content">
          <h3>${project.title}</h3>
          <p>${formatCategoryName(project.category)}</p>
        </div>
      </div>
    `;

    grid.appendChild(item);
  });

  // Init lazy load on dynamically appended assets
  initLazyLoader();
}

function formatCategoryName(cat) {
  return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' & ');
}

function initLazyLoader() {
  const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          if (lazyImage.dataset.srcset) {
            lazyImage.srcset = lazyImage.dataset.srcset;
          }
          
          // Blur load container transition trigger
          const container = lazyImage.closest('.blur-load');
          lazyImage.addEventListener('load', () => {
            if (container) container.classList.add('loaded');
          }, { once: true });

          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  }
}

/* --------------------------------------------------------------------------
   2. Category Filter Interaction
   -------------------------------------------------------------------------- */
function initPortfolioFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');
  if (filterButtons.length === 0 || items.length === 0) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active states
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      items.forEach(item => {
        if (filterVal === 'all') {
          item.style.display = 'block';
        } else {
          const itemFilters = item.getAttribute('data-filters') || '';
          if (itemFilters.includes(`filter-${filterVal}`)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        }
      });
    }, { passive: true });
  });

  // Check URL queries to auto-filter (e.g. clicking View Project in index library)
  const urlParams = new URLSearchParams(window.location.search);
  const projectParam = urlParams.get('project');
  if (projectParam) {
    const projId = parseInt(projectParam, 10);
    setTimeout(() => {
      openProjectModal(projId);
    }, 100);
  }
}

/* --------------------------------------------------------------------------
   3. Details Modal / Drawer Controller
   -------------------------------------------------------------------------- */
function initPortfolioModal() {
  const modal = document.getElementById('project-detail-modal');
  const closeBtn = document.getElementById('modal-close');
  const items = document.querySelectorAll('.portfolio-item');

  if (!modal || !closeBtn || items.length === 0) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const projId = parseInt(item.getAttribute('data-id'), 10);
      openProjectModal(projId);
    }, { passive: true });
  });

  const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal, { passive: true });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  }, { passive: true });

  // Esc key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });
}

function openProjectModal(projId) {
  const modal = document.getElementById('project-detail-modal');
  if (!modal || typeof PROJECTS_METADATA === 'undefined') return;

  const project = PROJECTS_METADATA.find(p => p.id === projId);
  if (!project) return;

  // Render modal content
  const modalImg = document.getElementById('modal-image');
  const modalTag = document.getElementById('modal-category-tag');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const materialsTags = document.getElementById('modal-materials-tags');
  const colorsTags = document.getElementById('modal-colors-tags');

  modalImg.src = project.path_1200;
  modalImg.alt = project.title;
  modalTag.textContent = formatCategoryName(project.category);
  modalTitle.textContent = project.title;
  modalDesc.textContent = project.description;

  // Build materials tags
  materialsTags.innerHTML = '';
  if (project.materials && project.materials.length > 0) {
    project.materials.forEach(mat => {
      const tag = document.createElement('span');
      tag.className = 'modal-spec-tag';
      tag.textContent = mat;
      materialsTags.appendChild(tag);
    });
  } else {
    materialsTags.innerHTML = '<span class="modal-spec-tag">Premium Finishes</span>';
  }

  // Build color tags
  colorsTags.innerHTML = '';
  if (project.colors && project.colors.length > 0) {
    project.colors.forEach(col => {
      const tag = document.createElement('span');
      tag.className = 'modal-spec-tag';
      tag.textContent = col;
      colorsTags.appendChild(tag);
    });
  } else {
    colorsTags.innerHTML = '<span class="modal-spec-tag">Studio Selected Palette</span>';
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/* --------------------------------------------------------------------------
   4. Mobile Navigation Drawer (For Portfolio Subpage Consistency)
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const overlay = document.querySelector('.mobile-overlay');
  const closeBtn = document.querySelector('.mobile-drawer-close');

  if (!toggle || !drawer || !closeBtn) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', openDrawer, { passive: true });
  closeBtn.addEventListener('click', closeDrawer, { passive: true });
  if (overlay) overlay.addEventListener('click', closeDrawer, { passive: true });
}

/* --------------------------------------------------------------------------
   5. WhatsApp Redirection Pulse Action
   -------------------------------------------------------------------------- */
function initWhatsAppPulse() {
  const phone = '919830098300';
  const message = 'Hi Infinity Atelier, I was looking at your design portfolio and would like to connect.';
  const encodedText = encodeURIComponent(message);
  
  const waBtn = document.querySelector('.whatsapp-float');
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
    }, { passive: true });
  }
}
