import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import User from '../src/models/User.js';
import Base from '../src/models/Base.js';
import Asset from '../src/models/Asset.js';
import Purchase from '../src/models/Purchase.js';
import Transfer from '../src/models/Transfer.js';
import Assignment from '../src/models/Assignment.js';
import Expenditure from '../src/models/Expenditure.js';
import Inventory from '../src/models/Inventory.js';
import AuditLog from '../src/models/AuditLog.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Base.deleteMany({});
    await Asset.deleteMany({});
    await Purchase.deleteMany({});
    await Transfer.deleteMany({});
    await Assignment.deleteMany({});
    await Expenditure.deleteMany({});
    await Inventory.deleteMany({});
    await AuditLog.deleteMany({});

    // Create Bases
    const bases = await Base.insertMany([
      {
        name: 'Fort Liberty',
        code: 'FL001',
        location: 'North Carolina, USA',
        capacity: 50000,
        description: 'Major military base',
      },
      {
        name: 'Fort Hood',
        code: 'FH002',
        location: 'Texas, USA',
        capacity: 45000,
        description: 'Central command base',
      },
      {
        name: 'Fort Benning',
        code: 'FB003',
        location: 'Georgia, USA',
        capacity: 40000,
        description: 'Infantry training base',
      },
    ]);

    console.log('✓ Bases created');

    // Create Users
    const adminPassword = await bcryptjs.hash('Admin@123', 10);
    const officerPassword = await bcryptjs.hash('Officer@123', 10);

    const users = await User.insertMany([
      {
        fullName: 'Admin User',
        email: 'admin@military.com',
        password: adminPassword,
        role: 'Admin',
      },
      {
        fullName: 'Colonel James Smith',
        email: 'commander1@military.com',
        password: officerPassword,
        role: 'Base Commander',
        base: bases[0]._id,
      },
      {
        fullName: 'Major Sarah Johnson',
        email: 'commander2@military.com',
        password: officerPassword,
        role: 'Base Commander',
        base: bases[1]._id,
      },
      {
        fullName: 'Captain Michael Brown',
        email: 'logistics1@military.com',
        password: officerPassword,
        role: 'Logistics Officer',
        base: bases[0]._id,
      },
      {
        fullName: 'First Lieutenant David Wilson',
        email: 'logistics2@military.com',
        password: officerPassword,
        role: 'Logistics Officer',
        base: bases[1]._id,
      },
    ]);

    console.log('✓ Users created');

    // Update base commanders
    await Base.updateMany(
      { _id: bases[0]._id },
      { commander: users[1]._id }
    );
    await Base.updateMany(
      { _id: bases[1]._id },
      { commander: users[2]._id }
    );

    // Create Assets
    const assets = await Asset.insertMany([
      {
        name: 'Humvee Military Vehicle',
        category: 'Vehicle',
        code: 'VEH001',
        description: 'High mobility multipurpose wheeled vehicle',
        unitOfMeasure: 'Unit',
        unitCost: 50000,
      },
      {
        name: 'M16 Rifle',
        category: 'Weapon',
        code: 'WPN001',
        description: 'Standard issue rifle',
        unitOfMeasure: 'Unit',
        unitCost: 800,
      },
      {
        name: '5.56mm Ammunition',
        category: 'Ammunition',
        code: 'AMM001',
        description: 'Standard rifle ammunition',
        unitOfMeasure: 'Box',
        unitCost: 150,
      },
      {
        name: 'Combat Body Armor',
        category: 'Equipment',
        code: 'EQP001',
        description: 'Protective body armor',
        unitOfMeasure: 'Unit',
        unitCost: 2000,
      },
      {
        name: 'Military Rations',
        category: 'Supplies',
        code: 'SUP001',
        description: 'Ready-to-eat meals',
        unitOfMeasure: 'Box',
        unitCost: 100,
      },
      {
        name: 'First Aid Kit',
        category: 'Equipment',
        code: 'EQP002',
        description: 'Medical first aid supplies',
        unitOfMeasure: 'Unit',
        unitCost: 500,
      },
    ]);

    console.log('✓ Assets created');

    // Create Purchases
    const purchases = await Purchase.insertMany([
      {
        asset: assets[0]._id,
        base: bases[0]._id,
        quantity: 10,
        unitCost: 50000,
        totalCost: 500000,
        supplier: 'Defense Contractors Inc',
        purchaseDate: new Date('2024-01-15'),
        invoiceNo: 'INV001',
        notes: 'Initial batch of vehicles',
        createdBy: users[3]._id,
      },
      {
        asset: assets[1]._id,
        base: bases[0]._id,
        quantity: 100,
        unitCost: 800,
        totalCost: 80000,
        supplier: 'Weapons Supplier Ltd',
        purchaseDate: new Date('2024-02-01'),
        invoiceNo: 'INV002',
        notes: 'Rifles for training',
        createdBy: users[3]._id,
      },
      {
        asset: assets[2]._id,
        base: bases[0]._id,
        quantity: 50,
        unitCost: 150,
        totalCost: 7500,
        supplier: 'Ammunition Depot',
        purchaseDate: new Date('2024-02-10'),
        invoiceNo: 'INV003',
        notes: 'Ammunition resupply',
        createdBy: users[3]._id,
      },
      {
        asset: assets[4]._id,
        base: bases[1]._id,
        quantity: 200,
        unitCost: 100,
        totalCost: 20000,
        supplier: 'Military Supplies Co',
        purchaseDate: new Date('2024-03-01'),
        invoiceNo: 'INV004',
        notes: 'Food supplies',
        createdBy: users[4]._id,
      },
    ]);

    console.log('✓ Purchases created');

    // Create Transfers
    const transfers = await Transfer.insertMany([
      {
        asset: assets[1]._id,
        fromBase: bases[0]._id,
        toBase: bases[1]._id,
        quantity: 20,
        transferDate: new Date('2024-03-15'),
        status: 'Received',
        approvedBy: users[1]._id,
        receivedBy: users[2]._id,
        receivedDate: new Date('2024-03-17'),
        notes: 'Transfer approved',
        createdBy: users[3]._id,
      },
      {
        asset: assets[2]._id,
        fromBase: bases[1]._id,
        toBase: bases[2]._id,
        quantity: 25,
        transferDate: new Date('2024-04-01'),
        status: 'In Transit',
        approvedBy: users[2]._id,
        notes: 'Pending receipt',
        createdBy: users[4]._id,
      },
    ]);

    console.log('✓ Transfers created');

    // Create Assignments
    const assignments = await Assignment.insertMany([
      {
        asset: assets[1]._id,
        base: bases[0]._id,
        personnelName: 'PFC Robert Anderson',
        rank: 'Private First Class',
        quantity: 1,
        assignedDate: new Date('2024-02-15'),
        status: 'Active',
        notes: 'Issued for field training',
        createdBy: users[1]._id,
      },
      {
        asset: assets[3]._id,
        base: bases[0]._id,
        personnelName: 'SGT Maria Garcia',
        rank: 'Sergeant',
        quantity: 2,
        assignedDate: new Date('2024-03-01'),
        status: 'Active',
        notes: 'Protective equipment issued',
        createdBy: users[1]._id,
      },
      {
        asset: assets[5]._id,
        base: bases[1]._id,
        personnelName: 'CPL James Lee',
        rank: 'Corporal',
        quantity: 1,
        assignedDate: new Date('2024-02-20'),
        status: 'Returned',
        returnedDate: new Date('2024-03-20'),
        notes: 'Returned in good condition',
        createdBy: users[2]._id,
      },
    ]);

    console.log('✓ Assignments created');

    // Create Expenditures
    const expenditures = await Expenditure.insertMany([
      {
        asset: assets[2]._id,
        base: bases[0]._id,
        quantity: 10,
        reason: 'Usage',
        expenditureDate: new Date('2024-03-20'),
        description: 'Used during training exercise',
        approvedBy: users[1]._id,
        createdBy: users[3]._id,
      },
      {
        asset: assets[4]._id,
        base: bases[1]._id,
        quantity: 30,
        reason: 'Usage',
        expenditureDate: new Date('2024-04-01'),
        description: 'Consumed during operations',
        approvedBy: users[2]._id,
        createdBy: users[4]._id,
      },
    ]);

    console.log('✓ Expenditures created');

    // Create Inventory records
    const inventory = [];
    for (const base of bases) {
      for (const asset of assets) {
        const baseInventory = new Inventory({
          base: base._id,
          asset: asset._id,
          openingBalance: 100,
          purchases: Math.floor(Math.random() * 50),
          transferIn: Math.floor(Math.random() * 20),
          transferOut: Math.floor(Math.random() * 15),
          assigned: Math.floor(Math.random() * 10),
          expended: Math.floor(Math.random() * 5),
        });

        baseInventory.closingBalance =
          baseInventory.openingBalance +
          baseInventory.purchases +
          baseInventory.transferIn -
          baseInventory.transferOut -
          baseInventory.assigned -
          baseInventory.expended;

        inventory.push(baseInventory);
      }
    }

    await Inventory.insertMany(inventory);
    console.log('✓ Inventory created');

    console.log('\n✅ All seed data created successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('Admin: admin@military.com / Admin@123');
    console.log('Commander: commander1@military.com / Officer@123');
    console.log('Logistics: logistics1@military.com / Officer@123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
