import { DashboardCategoryController } from "./DashboardCategoryController";
import {
  subscribeModifierSets,
  subscribeModifierSetItems,
  getLocalModifierSets,
  getLocalModifierSetItems,
  saveModifierSet,
  deleteModifierSet,
  reorderModifierSets,
  applyModifierSetToItems,
  removeModifierSetFromItem,
  saveItemModifierOverrides,
  reorderItemModifierSets,
} from "@/firebase/modifiersService";

export class DashboardModifierController extends DashboardCategoryController {
  constructor(props) {
    super(props);

    const localModifierSets = getLocalModifierSets();
    let initialModifierSet = this.state.editingModifierSet;
    if (!initialModifierSet && this.state.editingModifierSetId) {
      initialModifierSet =
        localModifierSets.find((s) => s.id === this.state.editingModifierSetId) || null;
    }

    this.state = {
      ...this.state,
      modifierSets: localModifierSets,
      modifierSetItems: getLocalModifierSetItems(),
      editingModifierSet: initialModifierSet,
      isApplyToItemsOpen: false,
      applyToItemsSet: null,
      hasLoadedModifiers: false,
    };

    this.unsubscribeModifierSets = null;
    this.unsubscribeModifierSetItems = null;
  }

  setupRealtimeSubscriptions(userId) {
    super.setupRealtimeSubscriptions(userId);
    this.setupModifierSubscriptions(userId);
  }

  setupModifierSubscriptions(userId) {
    if (!userId) return;
    if (this.unsubscribeModifierSets) this.unsubscribeModifierSets();
    if (this.unsubscribeModifierSetItems) this.unsubscribeModifierSetItems();

    const { unsubscribe, firstPromise } = subscribeModifierSets(
      userId,
      (sets) => {
        if (this._isMounted) {
          this.setState({ modifierSets: sets });
          const currentPath = this.props.router?.location?.pathname || "";
          if (currentPath.startsWith("/dashboard/items/modifiers/")) {
            const setId = currentPath.replace("/dashboard/items/modifiers/", "");
            const targetSet = sets.find((s) => s.id === setId);
            if (targetSet) {
              this.openEditModifierSet(targetSet, false);
            } else if (this.hasLoadedModifiers && this.navigateToModifiers) {
              this.navigateToModifiers();
            }
          }
        }
      },
      (sets) => {
        if (this._isMounted) {
          this.setState({ hasLoadedModifiers: true, modifierSets: sets });
        }
        this.hasLoadedModifiers = true;
        if (this.resolveModifiersFirst) {
          this.resolveModifiersFirst(sets);
        }
        const currentPath = this.props.router?.location?.pathname || "";
        if (currentPath.startsWith("/dashboard/items/modifiers/")) {
          const setId = currentPath.replace("/dashboard/items/modifiers/", "");
          const targetSet = sets.find((s) => s.id === setId);
          if (targetSet) {
            this.openEditModifierSet(targetSet, false);
          } else if (this.navigateToModifiers) {
            this.navigateToModifiers();
          }
        }
      }
    );
    this.unsubscribeModifierSets = unsubscribe;

    this.unsubscribeModifierSetItems = subscribeModifierSetItems(
      userId,
      (indexMap) => {
        if (this._isMounted) {
          this.setState({ modifierSetItems: indexMap });
        }
      }
    );
  }

  componentWillUnmount() {
    if (this.unsubscribeModifierSets) this.unsubscribeModifierSets();
    if (this.unsubscribeModifierSetItems) this.unsubscribeModifierSetItems();
    super.componentWillUnmount();
  }

  navigateToModifiers = () => {
    if (this.state.currentView !== "modifiers") {
      this.startViewLoading("modifiers");
    }
    if (this.props.router?.navigate) {
      this.props.router.navigate("/dashboard/items/modifiers");
    } else {
      this.setState({
        currentView: "modifiers",
        activeMenu: "modifiers",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateModifierOpen: false,
      });
    }
  };

  openCreateModifierSet = (updateUrl = true) => {
    this.setState({
      currentView: "modifiers",
      activeMenu: "modifiers",
      isItemsMenusOpen: true,
      isItemsOpen: true,
      isCreateModifierOpen: true,
      editingModifierSetId: null,
      editingModifierSet: null,
    });
    if (updateUrl && this.props.router?.navigate) {
      this.props.router.navigate("/dashboard/items/modifiers/new");
    }
  };

  openEditModifierSet = (set, updateUrl = true) => {
    this.setState({
      currentView: "modifiers",
      activeMenu: "modifiers",
      isItemsMenusOpen: true,
      isItemsOpen: true,
      isCreateModifierOpen: true,
      editingModifierSetId: set.id,
      editingModifierSet: set,
    });
    if (updateUrl && this.props.router?.navigate) {
      this.props.router.navigate(`/dashboard/items/modifiers/${set.id}`);
    }
  };

  handleCloseModifierSet = () => {
    this.setState({
      currentView: "modifiers",
      activeMenu: "modifiers",
      isItemsMenusOpen: true,
      isItemsOpen: true,
      isCreateModifierOpen: false,
      editingModifierSetId: null,
      editingModifierSet: null,
    });
    this.navigateToModifiers();
  };

  handleDiscardChanges = () => {
    const { unsavedChangesTarget } = this.state;
    if (unsavedChangesTarget === "modifier") {
      this.setState({
        isUnsavedChangesModalOpen: false,
        isCreateModifierOpen: false,
        editingModifierSetId: null,
        editingModifierSet: null,
      });
      this.navigateToModifiers();
      return;
    }
    super.handleDiscardChanges();
  };

  handleSaveModifierSet = async (setData) => {
    const { userId, modifierSets } = this.state;
    await saveModifierSet(userId, setData, modifierSets.length);
  };

  handleDeleteModifierSet = async (setId) => {
    const { userId } = this.state;
    await deleteModifierSet(userId, setId);
  };

  handleReorderModifierSets = async (reorderedSets) => {
    this.setState({ modifierSets: reorderedSets });
    const { userId } = this.state;
    await reorderModifierSets(userId, reorderedSets);
  };

  openApplyToItems = (set) => {
    this.setState({
      isApplyToItemsOpen: true,
      applyToItemsSet: set,
    });
  };

  handleCloseApplyToItems = () => {
    this.setState({
      isApplyToItemsOpen: false,
      applyToItemsSet: null,
    });
  };

  handleApplyModifierSetToItems = async (setId, targetItemIds, currentItemIds) => {
    const { userId } = this.state;
    await applyModifierSetToItems(userId, setId, targetItemIds, currentItemIds);
  };

  // Item-level Modifier Section Handlers
  handleApplyItemModifierSets = async (nextSetIds, currentSetIds) => {
    const { userId, editingItemId } = this.state;
    if (!editingItemId) return;

    // For each set that was added:
    const toAdd = nextSetIds.filter((id) => !currentSetIds.includes(id));
    const toRemove = currentSetIds.filter((id) => !nextSetIds.includes(id));

    for (const setId of toAdd) {
      await applyModifierSetToItems(userId, setId, [editingItemId], []);
    }
    for (const setId of toRemove) {
      await removeModifierSetFromItem(userId, editingItemId, setId);
    }
  };

  handleRemoveItemModifierSet = async (setId) => {
    const { userId, editingItemId } = this.state;
    if (!editingItemId) return;
    await removeModifierSetFromItem(userId, editingItemId, setId);
  };

  handleSaveItemModifierOverrides = async (setId, overrides) => {
    const { userId, editingItemId } = this.state;
    if (!editingItemId) return;
    await saveItemModifierOverrides(userId, editingItemId, setId, overrides);
  };

  handleReorderItemModifierSets = async (orderedSetIds) => {
    const { userId, editingItemId } = this.state;
    if (!editingItemId) return;
    await reorderItemModifierSets(userId, editingItemId, orderedSetIds);
  };
}
