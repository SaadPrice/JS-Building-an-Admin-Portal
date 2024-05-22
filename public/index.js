async function main() {
    let response = await fetch('http://localhost:3000/listBooks');
    let books = await response.json();

    books.forEach(renderBook);
}

function renderBook(book) {
    let bookContainer = document.querySelector('.book-container');
    bookContainer.innerHTML += `
        <div class="ui card">
            ${book.imageURL ?`
                <div class="image">
                    <img src="${book.imageURL}" />
                </div>
            ` : ``}
            <div class="content">
                <a class="header">${book.title}</a>
                <div class="meta">
                    <span class="date">Available: ${book.quantity}</span>
                </div>
                <div class="description">
                    ${book.description}
                </div>
            </div>
        </div>
    `;
}

main();
