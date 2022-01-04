module.exports = function (router, database) {

  // get all reservation
  router.get('/properties', (req, res) => {
    database.getAllProperties(req.query, 20)
      .then(properties => res.send({ properties }))
      .catch(e => {
        console.error(e);
        res.send(e)
      });
  });

  // get a fulfill reservation
  router.get('/reservations', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      res.send("💩");
      return;
    }

    database.getAllReservations(userId)
      .then(reservations => res.send({ reservations }))
      .catch(e => {

        console.error(e);
        res.send(e)
      });
  });


  // get upcoming reservation
  router.get('/reservations/upcoming', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      res.error('💩');
      return;
    }
    database.updateReservation(userId)
      .then(reservations => res.send({ reservations }))
      .catch(e => {
        console.error(e);
        res.send(e)
      });
  });

  // add a property
  router.post('/properties', (req, res) => {
    const userId = req.session.userId;
    database.addProperty({ ...req.body, owner_id: userId })
      .then(property => {
        res.send(property);
      })
      .catch(e => {
        console.error(e);
        res.send(e)
      });
  });

  //  add a reservation
  router.post('/reservations', (req, res) => {
    const userId = req.session.userId;
    if (userId) {
      database.addReservation({ ...req.body, guest_id: userId })
        .then(reservation => {
          res.send(reservation)
        })
        .catch(e => {
          console.error(e);
          res.send(e);
        })

    }

  });

  //  get an individual reservation
  router.get('/reservations/:reservationId', (req, res) => {
    const reservationId = req.params.reservationId;
    database.getIndividualReservation(reservationId)
      .then(reservation => res.send(reservation))
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  });

  // update a reservation
  router.post('/reservations/:reservationId', (req, res) => {
    console.log('res data: ', res)
    const reservationId = req.params.reservationId;
    database.updateReservation({ ...req.body, reservation_id: reservationId })
      .then(reservation => res.send(reservation))
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  });

  // delete a reservation
  router.delete('/reservations/:reservationId', (req, res) => {
    const reservationId = req.params.reservationId;
    console.log("Successfully!")
    database.deleteReservation(reservationId);
  })

  router.get('/reviews/:propertyId', (req, res) => {
    const propertyId = req.params.propertyId;
    database.getReviewsByProperty(propertyId)
      .then(reviews => {
        res.send(reviews);
      })
      .catch(e => {
        console.error(e);
        res.send(e);
      })
  })

  router.post('/reviews/:reservationId', (req, res) => {
    const reservationId = req.params.reservationId;
    database.addReview({ ...req.body })
      .then(review => {
        res.send(review)
      })
      .catch(e => {
        console.error(e);
        res.send(e);
      })
  })

  return router;
}
