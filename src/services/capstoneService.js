const Capstone = require("../models/capstone");
const drive = require("../config/googleDrive");
const { Readable } = require("stream");

exports.createCapstone = async ({ judul, kategori, deskripsi, alumni, file }) => {
  const existing = await Capstone.findOne({ alumni });
  if (existing) throw new Error("Alumni hanya boleh memiliki 1 capstone");

  let proposalFileId = null;

  if (file) {
    // Create readable stream from memory buffer
    const bufferStream = Readable.from(file.buffer);
    
    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Folder ID untuk menyimpan file
      },
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      supportsAllDrives: true, // Enable support for Shared Drives
      supportsTeamDrives: true // For backward compatibility
    });

    proposalFileId = response.data.id;
  }

  const capstone = new Capstone({
    judul,
    kategori,
    deskripsi,
    alumni,
    proposalFileId
  });

  return await capstone.save();
};

exports.getAllCapstones = async () => {
  return await Capstone.find().populate("alumni", "name email");
};

exports.getCapstoneDetail = async (id) => {
  return await Capstone.findById(id).populate("alumni", "name email");
};

exports.getProposalLinkForAdmin = async (capstoneId) => {
  const capstone = await Capstone.findById(capstoneId);
  if (!capstone) throw new Error("Capstone not found");
  if (!capstone.proposalFileId) throw new Error("Proposal not uploaded");

  if (!capstone.proposalUrl) {
    await drive.permissions.create({
      fileId: capstone.proposalFileId,
      requestBody: { role: "reader", type: "anyone" },
      supportsAllDrives: true, // Enable support for Shared Drives
      supportsTeamDrives: true // For backward compatibility
    });

    const result = await drive.files.get({
      fileId: capstone.proposalFileId,
      fields: "webViewLink",
      supportsAllDrives: true, // Enable support for Shared Drives
      supportsTeamDrives: true // For backward compatibility
    });

    capstone.proposalUrl = result.data.webViewLink;
    await capstone.save();
  }

  return capstone.proposalUrl;
};

exports.updateCapstone = async (capstoneId, updateData, file) => {
  const capstone = await Capstone.findById(capstoneId);
  if (!capstone) throw new Error("Capstone not found");

  // Update basic fields if provided
  if (updateData.judul !== undefined) capstone.judul = updateData.judul;
  if (updateData.kategori !== undefined) capstone.kategori = updateData.kategori;
  if (updateData.deskripsi !== undefined) capstone.deskripsi = updateData.deskripsi;
  if (updateData.status !== undefined) capstone.status = updateData.status;

  // Handle file upload if new file is provided
  if (file) {
    // Delete old file from Google Drive if exists
    if (capstone.proposalFileId) {
      try {
        await drive.files.delete({ 
          fileId: capstone.proposalFileId,
          supportsAllDrives: true, // Enable support for Shared Drives
          supportsTeamDrives: true // For backward compatibility
        });
      } catch (error) {
        console.error("Error deleting old file:", error);
      }
    }

    // Create readable stream from memory buffer
    const bufferStream = Readable.from(file.buffer);
    
    // Upload new file
    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      supportsAllDrives: true, // Enable support for Shared Drives
      supportsTeamDrives: true // For backward compatibility
    });

    capstone.proposalFileId = response.data.id;
    capstone.proposalUrl = null; // Reset URL so it gets regenerated
  }

  return await capstone.save();
};

exports.searchCapstones = async (query) => {
    const filter = {};

    if (query.judul) {
        filter.judul = { $regex: query.judul, $options: 'i' }; // Case-insensitive search
    }
    if (query.kategori) {
        filter.kategori = query.kategori;
    }

    return await Capstone.find(filter).populate("alumni", "name email");
};

exports.deleteCapstone = async (capstoneId) => {
  const capstone = await Capstone.findById(capstoneId);
  if (!capstone) throw new Error("Capstone not found");

  // Delete associated file from Google Drive if exists
  if (capstone.proposalFileId) {
    try {
      await drive.files.delete({ 
        fileId: capstone.proposalFileId,
        supportsAllDrives: true,
        supportsTeamDrives: true
      });
    } catch (error) {
      console.error("Error deleting file from Google Drive:", error);
      // Continue with capstone deletion even if file deletion fails
    }
  }

  // Delete capstone from database
  const deletedCapstone = await Capstone.findByIdAndDelete(capstoneId);
  return deletedCapstone;
};
