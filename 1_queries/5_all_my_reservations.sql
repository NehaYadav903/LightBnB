SELECT reservations.*, properties.*,
AVG(property_reviews.rating) as average_rating
FROM properties
JOIN reservations ON reservations.property_id = properties.id
LEFT JOIN property_reviews ON property_reviews.reservation_id = reservations.id
WHERE reservations.end_date < now()::date AND reservations.guest_id = 1
GROUP BY properties.id, properties.title, reservations.start_date,
properties.cost_per_night, reservations.id
ORDER BY start_date 
LIMIT 10;
