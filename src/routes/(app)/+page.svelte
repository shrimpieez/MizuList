<script>
  /** @type {import('./$types').PageData} */

  //dependencies
  import { formatDate, filterDataLastDay } from "$lib/utils";
  import { fade } from "svelte/transition";
  import { enhance } from "$app/forms";
  import { SvelteToast, toast } from "@zerodevx/svelte-toast";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  export let data;
  let { lastActivity, existingBook, user, book } = data;

  let books = data.weeklyPopularBooks;

  //toggling status publish form
  let showPublish = false;
  function togglePublish(value) {
    if (value == true) {
      showPublish = true;
    } else {
      showPublish = false;
    }
  }

  

  //filter the list of user by reading category
  const filteredItems = existingBook?.filter((item) =>
    item.bookCategory.includes(2)
  );

  // // filter function to uniquely identify each books
  $: uniqueLastActivity = $page.data.lastActivity?.filter(
    (activity, index, self) =>
      index === self.findIndex((a) => a.bookID === activity.bookID)
  );
  $: combinedArray = $page.data.status.concat(uniqueLastActivity);
  $: sortedCombinedArray = combinedArray.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  //use function definition for 'like' action
  const activityLike = () => {
    return async ({ result, update }) => {
      if (result.data.success) {
        console.log(sortedCombinedArray)
        await invalidateAll();
        await update();
      }
    };
  };
  
  //use function definition for 'like' action
  const statusLike = () => {
    return async ({ result, update }) => {
      if (result.data.success) {
        console.log(sortedCombinedArray)
        await invalidateAll();
        await update();
      }
    };
  };

  //updates page every 5 sec
  onMount(() => {
    const interval = setInterval(() => {
      invalidateAll(); //rerun load functions
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  });
</script>

<div class="wrap">
  <SvelteToast />
</div>

<div class="page-content" in:fade={{ duration: 300 }}>
  <div class="container">
    <div class="activity" style="width: 67%;">
      <h1>Global Activity</h1>
      <div class="aContainer">
        <form method="post" action="?/activityStatus">
          <div class="activityStatus">
            <input
              type="text"
              placeholder="Write a status..."
              name="text"
              autocomplete="off"
              on:input={() => togglePublish(true)}
            />
            {#if showPublish}
              <p>Please mind user behavior before posting</p>
              <div class="actions">
                <button
                  class="publish"
                  type="button"
                  style="background-color:#fafafa; color:#9299b5"
                  on:click={() => togglePublish(false)}>Cancel</button
                >
                <button class="publish" formaction="?/activityStatus"
                  >Publish</button
                >
              </div>
            {/if}
          </div>
        </form>
        
        {#each sortedCombinedArray.slice(0, 30) as book}      
            {#if book.book?.id}
            <form action="?/activityLike" method="post" use:enhance={activityLike}>
              <input type="hidden" name="id" bind:value={book.id} />
              <div class="bookCard">
                <div class="titleCover">
                  <div class="imageContainer">
                    <a href="/books/{book.book.id}">
                      {#if book.book?.coverUrl}
                        <img
                          src={book.book?.coverUrl}
                          alt={book.book?.englishTitle}
                        />
                      {:else}
                        <span>No cover available</span>
                      {/if}
                    </a>
                  </div>
                  <div class="details">
                    <div class="coverUser">
                      <img
                        src={`/uploads/userAvatars/${book.user?.id}.png`}
                        alt="User Avatar"
                        class="user-avatar"
                      />
                      <a href="/profile/{book.user?.username}/">
                        <div class="username">{book.user?.username}</div>
                      </a>
                    </div>

                    <div class="status">
                      {book.category?.name}
                      <div class="bookTitle">{book.title}</div>
                      <div>
                        {book.chapter ? book.chapter : "-"}/{book.book.chapters
                          ? book.book.chapters
                          : "?"}
                      </div>
                      <div>
                        Scored
                        <span
                          >{book.rating !== null && book.rating !== "0"
                            ? book.rating
                            : "-"}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <div class="A-Right">
                  <div class="timeStamp">
                    {formatDate(book.timestamp)}
                  </div>

                  <div class="likes">
                    {#if book.Like?.User?.some((user) => user?.id === $page.data?.userData?.id)}
                      <button formaction="?/activityLike" class="like">
                        <div class="likeCount">
                          {book?.Like?.User?.length}
                        </div>
                        <span
                          class="material-icons-round"
                          style="font-weight: 800; color: #b93850;"
                        >
                          favorite
                        </span></button
                      >
                    {:else}
                      <button formaction="?/activityLike" class="like">
                        {#if book?.Like?.User?.length > 0}
                          <div class="likeCount">
                            {book?.Like?.User?.length}
                          </div>
                        {/if}<span class="material-icons-round">
                          favorite_border
                        </span></button
                      >
                    {/if}
                  </div>
                </div>
              </div>
            </form>
            {:else}
            <form action="?/statusLike" method="post" use:enhance={statusLike}>
              <input type="hidden" name="id" bind:value={book.id} />
              <div class="statusCard">
                <div class="statusContent">
                  <div class="statusHeader">
                    <img
                      src={`/uploads/userAvatars/${book.user?.id}.png`}
                      alt="User Avatar"
                      class="userstatusavatar"
                    />
                    <a
                      data-sveltekit-preload-code
                      href="/profile/{book.user?.username}/"
                      ><span class="username" style="margin: 0 1rem;"
                        >{book.user?.username}</span
                      ></a
                    >
                  </div>
                  <div class="content">
                    <p>{book.text}</p>
                  </div>
                </div>

                <div class="statusRight">
                  <div class="timeStamp">
                    {formatDate(book.timestamp)}
                  </div>
                  <div class="likes">
                    {#if book.Like?.User?.some((user) => user?.id === $page.data?.userData?.id)}
                      <button formaction="?/statusLike" class="like">
                        <div class="likeCount">
                          {book?.Like?.User?.length}
                        </div>
                        <span
                          class="material-icons-round"
                          style="font-weight: 800; color: #b93850;"
                        >
                          favorite
                        </span></button
                      >
                    {:else}
                      <button formaction="?/statusLike" class="like">
                        {#if book?.Like?.User?.length > 0}
                          <div class="likeCount">
                            {book?.Like?.User?.length}
                          </div>
                        {/if}<span class="material-icons-round">
                          favorite_border
                        </span></button
                      >
                    {/if}
                  </div>
                </div>
              </div>
            </form>
            {/if}
        {/each}
      </div>
    </div>
    <div class="list-preview">
      {#if user?.name && filteredItems?.length > 0}
        <h1>Books in Progress</h1>
        <div class="list-container">
          {#each filteredItems as book}
            <div class="listCard">
              <a href="/books/{book.bookID}">
                {#if book.book.coverUrl}
                  <img
                    src={book.book?.coverUrl}
                    alt={book.book?.englishTitle}
                  />
                {:else}
                  <span>No cover available</span>
                  <!-- Show this if no cover was found from the API -->
                {/if}
              </a>
            </div>
          {/each}
        </div>
      {/if}
      <a style="color: #5c728a; margin-top: 13px" href="/browse"
        ><h1>Trending Books</h1></a
      >
      <div class="list-container">
        {#each books.slice(0, 8) as book}
          <div class="listCard">
            <a href="/books/{book.id}">
              {#if book.coverUrl}
                <img src={book?.coverUrl} alt={book?.englishTitle} />
              {:else}
                <span>No cover available</span>
                <!-- Show this if no cover was found from the API -->
              {/if}
            </a>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  * {
    font-family: "Overpass", sans-serif;
    outline: none;
    text-decoration: none;
  }

  :root {
    background-color: #edf1f5;
    color: #5c728a;
    overflow-y: scroll; /* Always show the vertical scroll bar */
  }

  .material-icons-round {
    font-family: "Material Symbols Rounded";
  }

  .page-content {
    margin: 0 18%;
  }

  .container {
    display: flex;
    justify-content: space-between;
    padding: 3rem 0;
    gap: 2rem;
  }

  h1 {
    font-size: 18px;
  }

  .aContainer {
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .activityStatus {
    display: flex;
    flex-direction: column;
    align-items: right;
  }

  .actions {
    display: flex;
    gap: 10px;
    justify-content: right;
  }

  .actions button {
    border: none;
    background-color: #3db4f2;
    padding: 9px 13px;
    border-radius: 5px;
    color: #edf1f5;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .activityStatus input {
    width: 100%;
    border: none;
    background-color: #fafafa;
    color: #585b5f;
    padding: 0.6rem 1rem;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .activityStatus p {
    text-align: right;
    margin-top: 1rem;
    font-size: 12px;
    font-weight: 400;
  }

  .activityStatus input:focus .activityStatus p {
    text-align: right;
    margin-top: 1rem;
    font-size: 11px;
    font-weight: 400;
  }

  .activityStatus input::placeholder {
    color: #aeb5bd;
    font-size: 13px;
  }

  .activityStatus input:focus {
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  }

  .statusCard {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: #fafafa;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.004);
    transition:
      transform 0.3s,
      box-shadow 0.3s ease-in-out;
  }

  .statusContent {
    display: flex;
    flex-direction: column;
  }

  .content {
    display: flex;
    word-break: break-all;
    line-height: 25px;
  }

  .statusHeader {
    display: flex;
    align-items: end;
  }

  .timeStamp {
    color: #9299a1;
    font-size: 11px;
    font-weight: 700;
  }

  .statusRight {
    width: max-content;
    display: flex;
    flex-direction: column;
    text-align: right;
    justify-content: space-between;
  }

  .content {
    padding-top: 1.3rem;
  }

  .username {
    font-size: 16px;
    color: #3db4f2;
    font-weight: 500;
  }

  .userstatusavatar {
    will-change: transform;
    height: 48px;
    width: 44px;
    border-radius: 4px;
    object-fit: cover;
  }

  .bookCard {
    transform-origin: center center;
    width: 100%;
    display: flex;
    height: 6.5rem;
    border-radius: 4px;
    background-color: #fafafa;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.004);
    transition:
      transform 0.3s,
      box-shadow 0.3s ease-in-out;
  }

  .bookCard:hover,
  .statusCard:hover {
    transform: scale(1.01);
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  }

  .titleCover {
    width: 100%;
    display: flex;
  }

  .imageContainer img {
    will-change: transform; /* Hint to the browser about upcoming change */
    display: flex;
    align-items: center;
    width: 70px;
    height: 100%;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    transition: transform 0.3s ease-in-out;
  }

  .details {
    display: flex;
    padding-left: 1rem;
    margin: 0.5rem 0;
    gap: 8%;
    font-size: 14px;
    flex-direction: column;
  }

  .coverUser {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-avatar {
    will-change: transform; /* Hint to the browser about upcoming change */
    height: 34px;
    width: 34px;
    border-radius: 50%;
    object-fit: cover;
  }

  .status {
    display: flex;
    gap: 5px;
  }

  .bookTitle {
    color: #3db4f2;
    font-weight: 500;
    transition: all 0.3s ease-in-out;
  }

  .username:hover {
    color: #1faafa;
  }

  .A-Right {
    display: flex;
    flex-direction: column;
    text-align: right;
    justify-content: space-between;
    color: #9299a1;
    padding: 1rem 1rem;
    /* font-size: 11px; */
    width: 6rem;
    font-weight: 600;
  }

  .likes {
    display: flex;
    justify-content: flex-end;
    font-size: 15px;
  }

  .likes button {
    display: flex;
    align-items: start;
    justify-content: center;
    background-color: transparent;
    border: none;
    color: inherit;
    box-sizing: border-box;
    font-weight: 600;
    gap: 1px;
    cursor: pointer;
  }

  .likes span {
    display: flex;
    height: 100%;
    transition: transform 0.3s ease-in-out;
  }

  .like span:hover {
    color: #e35b73;
    font-weight: 700;
  }

  .list-preview {
    width: 45%;
    display: flex;
    flex-direction: column;
    gap: 1.3rem;
  }

  .list-preview h1 {
    text-align: center;
  }

  .list-container {
    display: grid;
    background-color: #fafafa;
    grid-template-columns: repeat(auto-fill, minmax(20%, 1fr));
    grid-template-rows: repeat(auto-fill, minmax(115px, 1fr));
    box-sizing: border-box;
    border-radius: 4px;
    padding: 1rem;
    grid-gap: 20px;
    min-width: 0;
  }

  .listCard {
    max-width: 5.5rem;
    max-height: 8rem;
    border-radius: 4px;
    transition:
      transform 0.3s,
      box-shadow 0.3s;
    background-color: #9299a146;
  }
  .listCard img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3);
    background-color: rgb(202, 202, 202);
    border-radius: 4px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #fff;
  }

  .listCard:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
</style>
