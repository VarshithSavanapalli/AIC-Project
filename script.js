document.addEventListener('DOMContentLoaded', () => {

  // Navbar Mobile Toggle
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if(mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Fade-in Observer for scroll animations
  const faders = document.querySelectorAll('.fade-in');
  const appearOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };
  const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('appear');
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach(fader => {
    appearOnScroll.observe(fader);
  });

  // Cart Data Handlers
  let cart = JSON.parse(localStorage.getItem('everstore_cart')) || [];
  
  const updateCartBadge = () => {
    const counts = document.querySelectorAll('.cart-count');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    counts.forEach(c => c.textContent = total);
  };
  updateCartBadge();

  const saveCart = () => {
    localStorage.setItem('everstore_cart', JSON.stringify(cart));
    updateCartBadge();
  };

  const showToast = (message) => {
    let toast = document.querySelector('.toast');
    if(!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  };

  // Add to cart buttons (works on index and products pages)
  const addButtons = document.querySelectorAll('.add-to-cart');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const id = card.dataset.id;
      const name = card.querySelector('.product-name').textContent;
      const priceText = card.querySelector('.product-price').textContent;
      const price = parseFloat(priceText.replace('$', ''));
      const img = card.querySelector('img').src;

      const existing = cart.find(item => item.id === id);
      if(existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id, name, price, img, quantity: 1 });
      }
      saveCart();
      showToast(`✓ ${name} added to cart!`);
    });
  });

  // Filters logic on Products page
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card[data-category]');
  if(filterBtns.length > 0 && productCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        productCards.forEach(card => {
          if(filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
            setTimeout(()=> {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 10);
            
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(()=> {
                 card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // Open Product Detail
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't redirect if click was on or inside the add-to-cart button
      if(e.target.closest('.add-to-cart')) return;

      const id = card.dataset.id;
      const name = card.querySelector('.product-name').textContent;
      const price = card.querySelector('.product-price').textContent;
      const img = card.querySelector('img').src;
      const category = card.querySelector('.product-category').textContent;
      const ratingHTML = card.querySelector('.product-rating').innerHTML;

      const productDetails = { id, name, price, img, category, ratingHTML };
      localStorage.setItem('everstore_current_product', JSON.stringify(productDetails));
      
      window.location.href = 'product-detail.html';
    });
  });

  // Render Product Detail Page
  const detailContainer = document.getElementById('product-detail-container');
  if(detailContainer) {
    const product = JSON.parse(localStorage.getItem('everstore_current_product'));
    if(!product) {
       detailContainer.innerHTML = '<h2 style="grid-column: 1/-1; text-align: center;">Product not found. <a href="products.html" style="color:var(--color-accent); text-decoration:underline;">Go back to products</a></h2>';
    } else {
       detailContainer.innerHTML = `
         <div class="product-detail-img-wrapper">
             <img src="${product.img}" alt="${product.name}" class="product-detail-img">
         </div>
         <div class="product-detail-info">
             <div class="product-category" style="margin-bottom: 1rem; font-size: 1rem;">${product.category}</div>
             <h1>${product.name}</h1>
             <div class="product-rating" style="font-size: 1.2rem; margin-bottom: 1rem;">
                 ${product.ratingHTML}
             </div>
             <p class="product-detail-price">${product.price}</p>
             <p class="product-detail-desc">Experience the perfect blend of style and comfort with our ${product.name}. Carefully crafted from premium materials, this piece is designed to elevate your everyday wardrobe. Features unmatched durability and a modern silhouette that seamlessly transitions from day to night.</p>
             
             <div class="form-group" style="margin-bottom: 2.5rem;">
                 <label for="size-select" style="margin-bottom: 0.8rem; font-weight: 600;">Select Size</label>
                 <select id="size-select" style="width: 100%; padding: 1rem; border: 1px solid var(--color-lightgray); font-family: var(--font-body); font-size: 1rem; border-radius: 4px;">
                     <option value="s">Small</option>
                     <option value="m" selected>Medium</option>
                     <option value="l">Large</option>
                     <option value="xl">X-Large</option>
                 </select>
             </div>

             <div class="detail-actions">
                 <button class="btn detail-add-to-cart" style="width: 100%; padding: 1.2rem; font-size: 1.1rem;" data-id="${product.id}">Add to Cart</button>
             </div>
         </div>
       `;

       // Attach add to cart listener for the detail page
       const detailAddBtn = detailContainer.querySelector('.detail-add-to-cart');
       detailAddBtn.addEventListener('click', () => {
           const priceVal = parseFloat(product.price.replace('$', ''));
           const existing = cart.find(item => item.id === product.id);
           if(existing) {
             existing.quantity += 1;
           } else {
             cart.push({ id: product.id, name: product.name, price: priceVal, img: product.img, quantity: 1 });
           }
           saveCart();
           showToast(`✓ ${product.name} added to cart!`);
       });
    }
  }

  // Cart page logic
  const cartContainer = document.querySelector('.cart-items-container');
  const renderCart = () => {
    if(!cartContainer) return;
    
    if(cart.length === 0) {
      cartContainer.innerHTML = `
        <div style="text-align:center; padding: 4rem 2rem;">
          <h3 style="margin-bottom: 1.5rem; color: #888;">Your cart is entirely empty.</h3>
          <a href="products.html" class="btn">Continue Shopping</a>
        </div>
      `;
      document.querySelector('.summary-subtotal').textContent = '$0.00';
      document.querySelector('.summary-shipping').textContent = '$0.00';
      document.querySelector('.summary-total-val').textContent = '$0.00';
      return;
    }

    cartContainer.innerHTML = cart.map((item) => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="product-price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-qty">
          <button class="qty-btn minus" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn plus" data-id="${item.id}">+</button>
        </div>
        <button class="remove-btn" title="Remove" data-id="${item.id}">&times;</button>
      </div>
    `).join('');

    // Totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 150 ? 0 : 15; // Free shipping over 150
    const total = subtotal + shipping;

    document.querySelector('.summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector('.summary-shipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    document.querySelector('.summary-total-val').textContent = `$${total.toFixed(2)}`;

    attachCartListeners();
  };

  const attachCartListeners = () => {
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const item = cart.find(i => i.id === id);
        if(item) { item.quantity++; saveCart(); renderCart(); }
      });
    });
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const item = cart.find(i => i.id === id);
        if(item && item.quantity > 1) { 
            item.quantity--; 
            saveCart(); renderCart(); 
        } else if (item && item.quantity === 1) {
            cart = cart.filter(i => i.id !== id);
            saveCart(); renderCart();
        }
      });
    });
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        cart = cart.filter(i => i.id !== id);
        saveCart(); renderCart();
      });
    });
  };

  renderCart();

  // Checkout modal simulation
  const checkoutBtn = document.getElementById('checkout-btn');
  if(checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if(cart.length === 0) {
        alert("Please add items to your cart before checking out.");
        return;
      }
      alert("Order Placed Successfully! Thank you for shopping at EVERSTORE.");
      cart = [];
      saveCart();
      renderCart();
    });
  }

  // Account Tabs logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  if(tabBtns.length > 0 && tabContents.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
      });
    });
  }

  // Login & Registration Auth Simulation
  const loginForm = document.getElementById('login-form');
  const authSection = document.getElementById('auth-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const logoutBtn = document.getElementById('logout-btn');

  const checkAuth = () => {
    const user = localStorage.getItem('everstore_user');
    if(user && authSection && dashboardSection) {
      authSection.style.display = 'none';
      dashboardSection.style.display = 'block';
      const userNameEl = document.getElementById('user-name-display');
      if(userNameEl) userNameEl.textContent = JSON.parse(user).name;
    } else if (authSection && dashboardSection) {
      authSection.style.display = 'block';
      dashboardSection.style.display = 'none';
    }
  };

  if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('input[type="email"]').value;
      if(email) {
        const name = email.split('@')[0];
        localStorage.setItem('everstore_user', JSON.stringify({ email, name: name.charAt(0).toUpperCase() + name.slice(1) }));
        checkAuth();
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if(registerForm) {
     registerForm.addEventListener('submit', (e) => {
       e.preventDefault();
       const name = document.getElementById('reg-name').value;
       const email = document.getElementById('reg-email').value;
       const pass = document.getElementById('reg-pass').value;
       const confirm = document.getElementById('reg-confirm').value;

       if(pass !== confirm) {
         alert("Passwords do not match!"); return;
       }
       localStorage.setItem('everstore_user', JSON.stringify({ email, name }));
       checkAuth();
     });
  }

  if(logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('everstore_user');
      checkAuth();
    });
  }

  checkAuth();

  // Contact form validation & submission
  const contactForm = document.getElementById('contact-form');
  if(contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("Thanks for reaching out! We'll get back to you soon.");
      contactForm.reset();
    });
  }

  // FAQ Accordion
  const faqs = document.querySelectorAll('.faq-item');
  faqs.forEach(faq => {
    const question = faq.querySelector('.faq-question');
    question.addEventListener('click', () => {
      // close others
      faqs.forEach(item => {
        if(item !== faq) item.classList.remove('active');
      });
      faq.classList.toggle('active');
    });
  });

});
