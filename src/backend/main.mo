import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module MenuCategory {
    public func compare(cat1 : MenuCategory, cat2 : MenuCategory) : Order.Order {
      switch (cat1, cat2) {
        case (#breakfast, #breakfast) { #equal };
        case (#breakfast, _) { #less };
        case (_, #breakfast) { #greater };

        case (#lunch, #lunch) { #equal };
        case (#lunch, _) { #less };
        case (_, #lunch) { #greater };

        case (#dinner, #dinner) { #equal };
        case (#dinner, _) { #less };
        case (_, #dinner) { #greater };

        case (#beverages, #beverages) { #equal };
        case (#beverages, _) { #less };
        case (_, #beverages) { #greater };

        case (#snacks, #snacks) { #equal };
      };
    };
  };

  public type MenuCategory = {
    #breakfast;
    #lunch;
    #dinner;
    #beverages;
    #snacks;
  };

  module MenuItem {
    public func compare(item1 : MenuItem, item2 : MenuItem) : Order.Order {
      switch (Text.compare(item1.id, item2.id)) {
        case (#equal) {
          switch (Text.compare(item1.name, item2.name)) {
            case (#equal) {
              switch (MenuCategory.compare(item1.category, item2.category)) {
                case (#equal) {
                  if (item1.price < item2.price) { #less } else {
                    #greater;
                  };
                };
                case (order) { order };
              };
            };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  public type MenuItem = {
    id : Text;
    name : Text;
    description : Text;
    price : Float;
    category : MenuCategory;
    available : Bool;
    imageUrl : ?Text;
  };

  module OrderStatus {
    public func toNat(status : OrderStatus) : Nat {
      switch (status) {
        case (#pending) { 0 };
        case (#preparing) { 1 };
        case (#ready) { 2 };
        case (#completed) { 3 };
        case (#cancelled) { 4 };
      };
    };

    public func compare(status1 : OrderStatus, status2 : OrderStatus) : Order.Order {
      Nat.compare(toNat(status1), toNat(status2));
    };
  };

  public type OrderStatus = {
    #pending;
    #preparing;
    #ready;
    #completed;
    #cancelled;
  };

  public type OrderItem = {
    menuItemId : Text;
    quantity : Nat;
  };

  module OrderRecord {
    public func compare(order1 : OrderRecord, order2 : OrderRecord) : Order.Order {
      Text.compare(order1.id, order2.id);
    };
  };
  public type OrderRecord = {
    id : Text;
    customer : Principal;
    items : [OrderItem];
    totalPrice : Float;
    timestamp : Int;
    status : OrderStatus;
  };

  let menuItems = Map.empty<Text, MenuItem>();
  let orders = Map.empty<Text, OrderRecord>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getMenuItem(id : Text) : async ?MenuItem {
    menuItems.get(id);
  };

  public query ({ caller }) func getAllMenuItems() : async [MenuItem] {
    menuItems.values().toArray();
  };

  public query ({ caller }) func getMenuItemsByCategory(category : MenuCategory) : async [MenuItem] {
    let filtered = List.empty<MenuItem>();
    for (item in menuItems.values()) {
      if (item.category == category) {
        filtered.add(item);
      };
    };
    filtered.toArray();
  };

  public query ({ caller }) func getAvailableMenuItems() : async [MenuItem] {
    let filtered = List.empty<MenuItem>();
    for (item in menuItems.values()) {
      if (item.available) {
        filtered.add(item);
      };
    };
    filtered.toArray();
  };

  public shared ({ caller }) func addMenuItem(item : MenuItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add menu items");
    };
    if (menuItems.containsKey(item.id)) {
      Runtime.trap("Menu item with this id already exists.");
    };
    menuItems.add(item.id, item);
  };

  public shared ({ caller }) func updateMenuItem(id : Text, item : MenuItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };
    if (not menuItems.containsKey(id)) {
      Runtime.trap("Menu item does not exist");
    };
    menuItems.add(id, item);
  };

  public shared ({ caller }) func toggleMenuItemAvailability(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle menu item availability");
    };
    switch (menuItems.get(id)) {
      case (null) {
        Runtime.trap("Menu item does not exist");
      };
      case (?item) {
        let updatedItem = {
          id = item.id;
          name = item.name;
          description = item.description;
          price = item.price;
          category = item.category;
          available = not item.available;
          imageUrl = item.imageUrl;
        };
        menuItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete menu items");
    };
    if (not menuItems.containsKey(id)) {
      Runtime.trap("Menu item does not exist");
    };
    menuItems.remove(id);
  };

  public shared ({ caller }) func createOrder(order : OrderRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    if (orders.containsKey(order.id)) {
      Runtime.trap("Order with this id already exists.");
    };
    let newOrder = {
      id = order.id;
      customer = caller;
      items = order.items;
      totalPrice = order.totalPrice;
      timestamp = Time.now();
      status = #pending;
    };
    orders.add(order.id, newOrder);
  };

  public query ({ caller }) func getOrder(id : Text) : async ?OrderRecord {
    orders.get(id);
  };

  public query ({ caller }) func getUserOrders() : async [OrderRecord] {
    let filtered = List.empty<OrderRecord>();
    for ((_, order) in orders.entries()) {
      if (order.customer == caller) {
        filtered.add(order);
      };
    };
    filtered.toArray();
  };

  public shared ({ caller }) func updateOrderStatus(id : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(id)) {
      case (null) {
        Runtime.trap("Order does not exist");
      };
      case (?order) {
        let updatedOrder = {
          id = order.id;
          customer = order.customer;
          items = order.items;
          totalPrice = order.totalPrice;
          timestamp = order.timestamp;
          status;
        };
        orders.add(id, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [OrderRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all orders");
    };
    let filtered = List.empty<OrderRecord>();
    for ((_, order) in orders.entries()) {
      if (order.status == status) {
        filtered.add(order);
      };
    };
    filtered.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [OrderRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all orders");
    };
    orders.values().toArray();
  };
};
