SELECT city, COUNT(start_date) as total_reservations
FROM properties
JOIN reservations ON property_id = properties.id
GROUP BY properties.city
ORDER BY total_reservations DESC;