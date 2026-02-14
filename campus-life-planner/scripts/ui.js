const burger = document.getElementById('burger');
const sidebar = document.querySelector('aside');

// Toggle sidebar on burger click
burger.addEventListener('click', (e) => {
  sidebar.classList.toggle('active');
  e.stopPropagation(); // prevent immediate close
});

// Close sidebar if clicking outside
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
  }
});

// Prevent sidebar clicks from closing itself
sidebar.addEventListener('click', (e) => {
  e.stopPropagation();
});

console.log('JS loaded');
