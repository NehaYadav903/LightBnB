$(() => {
  window.header = {};

  const $pageHeader = $('#page-header');
  let currentUser = null;
  function updateHeader(user) {
    currentUser = user;
    $pageHeader.find("#page-header__user-links").remove();
    let userLinks;

    if (!user) {
      userLinks = `
      <nav id="page-header__user-links" class="page-header__user-links">
        <ul>
          <li class="home">🏠</li>
          <li class="search_button">Search</li>
          <li class="login_button">Log In</li>
          <li class="sign-up_button">Sign Up</li>
        </ul>
      </nav>
      `
    } else {
      userLinks = `
      <nav id="page-header__user-links" class="page-header__user-links">
        <ul>
          <li class="home">🏠</li>
          <li class="search_button">Search</li>
          <li>${user.name}</li>
          <li class="create_listing_button">Create Listing</li>
          <li class="my_listing_button">My Listings</li>
          <li class="my_reservations_button">My Reservations</li>
          <li class="logout_button">Log Out</li>
        </ul>
      </nav>
      `
    }

    $pageHeader.append(userLinks);
  }

  window.header.update = updateHeader;

  getMyDetails()
    .then(function( json ) {
    updateHeader(json.user);
  })
  .catch(error => console.error(error));

  $("header").on("click", '.my_reservations_button', function() {
    propertyListings.clearListings();
    getFulfilledReservations()
      .then(function(json) {
        propertyListings.addProperties(json.reservations, { upcoming: false });
        getUpcomingReservations()
        .then(json => {
          propertyListings.addProperties(json.reservations, { upcoming: true })
        })
        views_manager.show('listings');
      })
      .catch(error => console.error(error));
  });
  
  $("header").on("click", '.my_listing_button', function() {
    propertyListings.clearListings();
    getAllListings(`owner_id=${currentUser.id}`)
      .then(function(json) {
        propertyListings.addProperties(json.properties);
        views_manager.show('listings');
    });
  });

  $("header").on("click", '.home', function() {
    propertyListings.clearListings();
    getAllListings()
      .then(function(json) {
        propertyListings.addProperties(json.properties);
        views_manager.show('listings');
    });
  });

  $('header').on('click', '.search_button', function() {
    views_manager.show('searchProperty');
  });

  $("header").on('click', '.login_button', () => {
    views_manager.show('logIn');
  });
  $("header").on('click', '.sign-up_button', () => {
    views_manager.show('signUp');
  });
  $("header").on('click', '.logout_button', () => {
    logOut().then(() => {
      header.update(null);
    });
  });

  $('header').on('click', '.create_listing_button', function() {
    views_manager.show('newProperty');
  });

});

$('.update-button').on('click', function() {
  const idData = $(this).attr('id').substring(16);
  getIndividualReservation(idData).then(data => {
    views_manager.show("updateReservation", data);       
  });
})

$updateReservationForm.on('submit', function (event) {
  let errorMessage = "";
  let startDate;
  let endDate;
  let originalStartDate = new Date($("#datatag-start-date").text());
  let originalEndDate = new Date($("#datatag-end-date").text())
  event.preventDefault();
  views_manager.show('none');
  const formArray = $(this).serializeArray();
  console.log(formArray);
  // check for presence of variables, if they're there, assign them
  if (formArray[0].value && formArray[1].value && formArray[2].value) {
    startDate = `${formArray[2].value}-${formArray[1].value}-${formArray[0].value}`
  }

  if (formArray[3].value && formArray[4].value && formArray[5].value) {
    endDate = `${formArray[5].value}-${formArray[4].value}-${formArray[3].value}`
  }

  if (!startDate && !endDate) {
    errorMessage = `Please provide either a complete start or end date.`
  }

  if (new Date(endDate) <= Date.now()) {
    errorMessage = `End date cannot be on or before today's date.`
  }

  if (new Date(startDate) < Date.now()) {
    errorMessage = `Start date cannot be before today's date.`
  }

  // end date being updated
  if (!startDate && endDate) {
    if (new Date(endDate) <= originalStartDate) {
      errorMessage = `End date cannot be on or before the original start date.`
    }
  }

  // start date being updated
  if (!endDate && startDate) {
    if (new Date(startDate) >= originalEndDate) {
      errorMessage = `Start date cannot be on or after the original end date.`
    }
  }

  // start date and end date being updated
  if (startDate && endDate) {
    if (new Date(startDate) >= new Date(endDate)) {
      errorMessage = "New start date cannot be on or after the new end date.";
    }
  }

  if ((startDate || endDate) && !errorMessage) {
    const reservationId = $(this).find("#datatag-reservation-id").text();
    const dataObj = { start_date: startDate, end_date: endDate, reservation_id: reservationId };
    updateReservation(dataObj)
    .then(data => {
      console.log(`updated reservation: ${data}`);
      views_manager.show('none');
      propertyListings.clearListings();
      getFulfilledReservations()
        .then(function(json) {
          propertyListings.addProperties(json.reservations, { upcoming: false });
          getUpcomingReservations()
          .then(json => {
            propertyListings.addProperties(json.reservations, { upcoming: true })
          })
          views_manager.show('listings');
        })
    })
    .catch(error => {
      console.error(error);
      views_manager.show('listings');
    })
    // we can redisplay the form by pulling the information in the datatag!
    // const dataObj = {
    //   id: $(this).find('#datatag-reservation-id').text(),
    //   start_date: $(this).find('#datatag-start-date').text(),
    //   end_date: $(this).find('#datatag-end-date').text(),
    //   property_id: $(this).find('#datatag-property-id').text(),
    //   error_message: errorMessage
    // }
    // views_manager.show('updateReservation', dataObj);
  }
});