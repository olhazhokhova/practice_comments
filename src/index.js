import './css/styles.css';
import axios from 'axios';
import throttle from 'lodash.throttle';

const comments = document.querySelector('.comments');
const form = document.querySelector('.comment-form');
const toggle = document.querySelector('.toggle-comments');
const filter = document.querySelector('.filter');

axios.defaults.baseURL = 'https://61a1f0af014e1900176de7da.mockapi.io/api/v1';

const getComments = () => {
  return axios.get('/comments');
};

const renderComments = async () => {
  const { data } = await getComments();

  comments.innerHTML = toggle.dataset.checked
    ? createMarkupWithSpam(data)
    : createMarkupWithoutSpam(data);
};

function createMarkupWithSpam(data) {
  const markup = data
    .filter(el => {
      return el.comment.toLowerCase().includes('spam') || el.comment.toLowerCase().includes('sale');
    })
    .map(({ comment, name, createdAt, id }) => {
      return `
      <div class="item">
        ${name}
        <div>
          ${comment}
        </div>
        ${createdAt}
        <button class="delete" data-id="${id}">x</button>
      </div>
    `;
    })
    .join('');
  return markup;
}

function createMarkupWithoutSpam(data) {
  const markup = data
    .filter(el => {
      return (
        !el.comment.toLowerCase().includes('spam') || !el.comment.toLowerCase().includes('sale')
      );
    })
    .map(({ comment, name, createdAt, id }) => {
      return `
      <div class="item">
        ${name}
        <div>
          ${comment}
        </div>
        ${createdAt}
        <button class="delete" data-id="${id}">x</button>
      </div>
    `;
    })
    .join('');
  return markup;
}

function createMarkupByFilter(data) {
  const markup = data
    .map(({ comment, name, createdAt, id }) => {
      return `
      <div class="item">
        ${name}
        <div>
          ${comment}
        </div>
        ${createdAt}
        <button class="delete" data-id="${id}">x</button>
      </div>
    `;
    })
    .join('');
  return markup;
}

window.addEventListener('DOMContentLoaded', renderComments);

form.addEventListener('submit', addComment);

comments.addEventListener('click', deleteComment);

toggle.addEventListener('click', toggleComments);

filter.addEventListener('input', throttle(filterComments, 1000));

async function addComment(e) {
  e.preventDefault();

  const { name, comment } = e.currentTarget.elements;

  const commentObj = {
    name: name.value,
    comment: comment.value,
  };

  await axios.post('/comments', commentObj);
  renderComments();
}

async function deleteComment(e) {
  if (e.target.nodeName !== 'BUTTON') {
    return;
  }
  await axios.delete(`/comments/${e.target.dataset.id}`);
  renderComments();
}

function toggleComments(e) {
  if (!e.currentTarget.dataset.checked) {
    renderComments();
    e.currentTarget.textContent = 'Check comments';
    e.currentTarget.dataset.checked = true;
    return;
  }
  renderComments();
  e.currentTarget.textContent = 'Check comments with spam';
  e.currentTarget.dataset.checked = '';
}

async function filterComments(e) {
  const { data } = await getComments();

  const filteredComments = data.filter(el => {
    return el.name.toLowerCase().includes(e.target.value.toLowerCase().trim());
  });

  comments.innerHTML = createMarkupByFilter(filteredComments);
}
