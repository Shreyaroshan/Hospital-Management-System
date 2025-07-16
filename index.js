import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Hospital_Management",
  password: "postgresql",
  port: 5432,
});

db.connect()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error", err.stack));

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

//API Endpoint to Insert Patient Data
app.post("/api/patients", async (req, res) => {
  const { name, lname, dob, phone, address, blood_group, diagnosis } = req.body;

  if (!name || !lname || !dob || !phone || !address || !blood_group || !diagnosis) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // Insert into patient table and get the new patient_id
    const result = await db.query(
      "INSERT INTO patient (name, lname, dob, phone, address, blood_group) VALUES ($1, $2, $3, $4, $5, $6) RETURNING patient_id",
      [name, lname, dob, phone, address, blood_group]
    );

    const patient_id = result.rows[0].patient_id;

    // Insert diagnosis into medical_record table
    await db.query(
      "INSERT INTO medical_record (patient_id, diagnosis, date) VALUES ($1, $2, CURRENT_DATE)",
      [patient_id, diagnosis]
    );

    res.json({ success: true, message: "Patient registered and diagnosis saved successfully" });

  } catch (error) {
    console.error("Error registering patient:", error.message);
    res.status(500).json({ success: false, message: "Server error while registering patient." });
  }
});
// GET medical records for a specific patient
app.get("/api/medical-records/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM medical_record WHERE patient_id = $1 ORDER BY date DESC",
      [patientId]
    );
    res.json({ records: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

  

// Endpoint to fetch patient profile by ID
app.get("/api/patient/profile/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "SELECT patient_id, name, lname, dob, address, phone, blood_group FROM patient WHERE patient_id = $1",
      [id]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, patient: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: "Patient not found" });
    }
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});





app.get("/api/patient2/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const result = await db.query("SELECT * FROM patient WHERE patient_id = $1", [id]);

      if (result.rows.length > 0) {
          res.json({ success: true, patient: result.rows[0] });
      } else {
          res.status(404).json({ success: false, message: "Patient not found" });
      }
  } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});
// GET /api/bill/:patientId
// Assuming you already have `pool` set up for PostgreSQL

app.get("/api/bill/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const result = await db.query(
          `SELECT * FROM bill WHERE patient_id = $1 ORDER BY date DESC, time DESC LIMIT 1`,
          [id]
      );

      if (result.rows.length > 0) {
          res.json({ success: true, bill: result.rows[0] });
      } else {
          res.status(404).json({ success: false, message: "No bill found for this patient" });
      }
  } catch (error) {
      console.error("Error fetching bill:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});


app.get("/api/appointment/:id", async (req, res) => {
  const { id } = req.params;

  try {
      const result = await db.query(
          "SELECT * FROM appointment WHERE patient_id = $1",
          [id]
      );

      if (result.rows.length > 0) {
          res.json({ success: true, appointments: result.rows });
      } else {
          res.json({ success: true, appointments: [] });
      }
  } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});
app.post("/api/book-appointment", async (req, res) => {
  const { patient_id, doctor_id, specialization, date, time } = req.body;

  try {
      // Insert into appointment
      const insertAppointment = `
          INSERT INTO appointment (patient_id, doctor_id, specialization, date, time)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING appointment_id
      `;
      const appointmentResult = await db.query(insertAppointment, [patient_id, doctor_id, specialization, date, time]);

      // Insert into prescription with NULL medicine & diagnosis
      const insertPrescription = `
          INSERT INTO prescription (patient_id, doctor_id, medicine, diagnosis)
          VALUES ($1, $2, NULL, NULL)
      `;
      await db.query(insertPrescription, [patient_id, doctor_id]);

      res.json({ success: true, message: "Appointment booked and prescription placeholder created." });
  } catch (error) {
      console.error("❌ Error booking appointment:", error);
      res.status(500).json({ success: false, message: "Server error while booking appointment." });
  }
});
app.get("/api/prescription/:patient_id", async (req, res) => {
  const { patient_id } = req.params;
  try {
      const result = await db.query(
          "SELECT * FROM prescription WHERE patient_id = $1",
          [patient_id]
      );
      res.json({ success: true, prescriptions: result.rows });
  } catch (err) {
      console.error("Error fetching prescriptions:", err);
      res.status(500).json({ success: false, message: "Server error" });
  }
});
// Example route in Express
app.get("/api/doctors/:doctor_id", async (req, res) => {
  const { doctor_id } = req.params;

  try {
      const result = await db.query(
          "SELECT * FROM DOCTOR WHERE doctor_id = $1",
          [doctor_id]
      );

      if (result.rows.length > 0) {
          res.json({ success: true, doctor: result.rows[0] });
      } else {
          res.json({ success: false, message: "Doctor not found" });
      }
  } catch (error) {
      console.error("Error fetching doctor details:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
app.get("/api/doctor/:id", async (req, res) => {
  try {
      const { id } = req.params;
      // Query the database to fetch the doctor details
      const result = await db.query("SELECT * FROM doctor WHERE doctor_id = $1", [id]);

      if (result.rows.length > 0) {
          res.json({ success: true, doctor: result.rows[0] });
      } else {
          res.status(404).json({ success: false, message: "Doctor not found" });
      }
  } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});
// Endpoint to get appointments for a specific doctor
// Assuming your database model for appointments is correct
// Endpoint to get appointments for a specific doctor

// GET: Appointments without prescriptions
app.get("/api/appointments2/:doctor_id", async (req, res) => {
  const doctorID = req.params.doctor_id; // Get doctor_id from the URL parameter
const result = await db.query(
  "SELECT a.* FROM appointment a JOIN prescription p ON a.patient_id = p.patient_id WHERE p.diagnosis IS NULL AND a.doctor_id = $1 ORDER BY a.date, a.time",
  [doctorID]
);

if (result.rows.length > 0) {
  res.json({ success: true, appointments: result.rows });
} else {
  res.status(404).json({ success: false, message: "No appointments found for this doctor with null diagnosis" });
}

});





app.get("/api/doctors", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM doctor ORDER BY doctor_id");

    res.json({ success: true, doctors: result.rows });
  } catch (error) {
    console.error("Error fetching doctors:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update prescription endpoint
// Update prescription endpoint
app.post("/api/update-prescription", async (req, res) => {
  const { patient_id, medicine, diagnosis } = req.body;

  if (!patient_id || !medicine || !diagnosis) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Update the prescription for the given patient
    const updateQuery = `
      UPDATE prescription
      SET medicine = $1, diagnosis = $2
      WHERE patient_id = $3
      RETURNING *;
    `;
    
    const result = await db.query(updateQuery, [medicine, diagnosis, patient_id]);

    if (result.rows.length > 0) {
      res.json({
        success: true,
        message: "✅ Prescription updated successfully",
        updatedPrescription: result.rows[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "❌ Prescription not found for this patient",
      });
    }
  } catch (error) {
    console.error("Error updating prescription:", error);
    res.status(500).json({
      success: false,
      message: "❌ Failed to update prescription. Server error.",
    });
  }
});

app.get("/api/doctor-appointments/:doctor_id", async (req, res) => {
  const doctorID = req.params.doctor_id; // Get doctor_id from the URL parameter
  try {
    const result = await db.query(
      "SELECT a.* FROM appointment a JOIN prescription p ON a.patient_id = p.patient_id WHERE p.diagnosis IS NULL AND a.doctor_id = $1 ORDER BY a.date, a.time",
      [doctorID]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, appointments: result.rows });
    } else {
      res.status(404).json({ success: false, message: "No appointments found for this doctor with null diagnosis" });
    }
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/patient/details/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
      // Fetch patient details
      const patientResult = await db.query(
          "SELECT patient_id, name, lname, dob, phone, address, blood_group FROM patient WHERE patient_id = $1",
          [patientId]
      );

      if (patientResult.rows.length === 0) {
          return res.status(404).json({ success: false, message: "Patient not found" });
      }

      // Return the patient details
      res.json({
          success: true,
          patient: patientResult.rows[0],
      });

  } catch (error) {
      console.error("Error fetching patient details:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});
app.post('/admin-login', async (req, res) => {
  const { admin_id } = req.body;

  try {
    // Query the database to check if the admin_id exists
    const result = await pool.query('SELECT * FROM admin WHERE admin_id = $1', [admin_id]);

    if (result.rows.length > 0) {
      // Admin exists, redirect to bill.html
      res.redirect('/bill.html');
    } else {
      // Admin does not exist, send an alert and stay on login page
      res.send(`<script>alert("Admin ID not found!"); window.location.href="/admin-login.html";</script>`);
    }
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/api/add-bill', async (req, res) => {
  const { patient_id, admin_id, date, time, amount } = req.body;

  try {
    // Use db.query() to interact with the database
    const result = await db.query(
      `INSERT INTO bill (patient_id, admin_id, date, time, amount)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patient_id, admin_id, date, time, amount]
    );

    // Respond with the inserted bill data
    res.status(201).json({
      message: '✅ Bill generated successfully',
      data: result.rows[0], // Return the newly added bill data
    });
  } catch (error) {
    console.error('Error inserting bill:', error); // Log the error for debugging
    res.status(500).json({ message: '❌ Failed to generate bill', error: error.message });
  }
});

app.get("/api/latest-appointment", async (req, res) => {
  try {
    const query = `
      SELECT a.appointment_id, a.patient_id, a.specialization, a.doctor_id, a.date, a.time, d.fee
      FROM appointment a
      JOIN doctor d ON a.doctor_id = d.doctor_id
      WHERE NOT EXISTS (
        SELECT 1 
        FROM bill b 
        WHERE b.patient_id = a.patient_id 
         
          AND b.time = a.time
      )
      ORDER BY a.appointment_id DESC
      LIMIT 1;
    `;

    const result = await db.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No unbilled appointments found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching latest appointment:", error);
    res.status(500).json({ message: "Server error." });
  }
});



// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
