// Design Peer Review Validator - Simple Working Version
figma.showUI(__html__, { width: 450, height: 500 });

// Get current page ID for storage key
function getPageStorageKey() {
  return `peerReviewChecks_${figma.currentPage.id}`;
}

// Load saved manual check states from current page
async function loadManualChecks() {
  try {
    const pageKey = getPageStorageKey();
    const pageData = figma.currentPage.getPluginData(pageKey);
    let savedChecks;
    
    if (pageData) {
      savedChecks = JSON.parse(pageData);
      
      // Handle both old format (boolean) and new format (object with timestamp)
      const normalizedChecks = {
        appropriateFile: typeof savedChecks.appropriateFile === 'object' ? savedChecks.appropriateFile : { checked: savedChecks.appropriateFile, timestamp: null },
        annotations: typeof savedChecks.annotations === 'object' ? savedChecks.annotations : { checked: savedChecks.annotations, timestamp: null },
        fsgApproval: typeof savedChecks.fsgApproval === 'object' ? savedChecks.fsgApproval : { checked: savedChecks.fsgApproval, timestamp: null },
        prototype: typeof savedChecks.prototype === 'object' ? savedChecks.prototype : { checked: savedChecks.prototype || false, timestamp: null },
        radiusComponents: typeof savedChecks.radiusComponents === 'object' ? savedChecks.radiusComponents : { checked: savedChecks.radiusComponents || false, timestamp: null }
      };
      
      savedChecks = normalizedChecks;
    } else {
      // No saved data for this page - start with empty state
      savedChecks = {
        appropriateFile: { checked: false, timestamp: null },
        annotations: { checked: false, timestamp: null },
        fsgApproval: { checked: false, timestamp: null },
        prototype: { checked: false, timestamp: null },
        radiusComponents: { checked: false, timestamp: null }
      };
    }
    
    // Send saved states to UI
    figma.ui.postMessage({ 
      type: 'load-saved-checks', 
      savedChecks: savedChecks 
    });
  } catch (error) {
    console.error('Error loading saved checks:', error);
    // Fallback to empty state
    figma.ui.postMessage({ 
      type: 'load-saved-checks', 
      savedChecks: { 
        appropriateFile: { checked: false, timestamp: null }, 
        annotations: { checked: false, timestamp: null }, 
        fsgApproval: { checked: false, timestamp: null },
        prototype: { checked: false, timestamp: null },
        radiusComponents: { checked: false, timestamp: null }
      }
    });
  }
}

// Save manual check states to current page (shared across users)
async function saveManualChecks(manualChecks) {
  try {
    // Save to current page (shared across users)
    const pageKey = getPageStorageKey();
    
    // Get existing data to preserve timestamps
    const existingData = figma.currentPage.getPluginData(pageKey);
    let existingChecks = {};
    
    if (existingData) {
      try {
        existingChecks = JSON.parse(existingData);
        // Handle old format (boolean) by converting to new format
        if (typeof existingChecks.appropriateFile === 'boolean') {
          existingChecks = {
            appropriateFile: { checked: existingChecks.appropriateFile, timestamp: null },
            annotations: { checked: existingChecks.annotations, timestamp: null },
            fsgApproval: { checked: existingChecks.fsgApproval, timestamp: null },
            prototype: { checked: existingChecks.prototype || false, timestamp: null },
            radiusComponents: { checked: existingChecks.radiusComponents || false, timestamp: null }
          };
        }
      } catch (error) {
        console.error('Error parsing existing data:', error);
        existingChecks = {};
      }
    }
    
    // Add timestamps and user info only for newly checked items
    const timestamp = new Date().toISOString();
    const currentUser = figma.currentUser ? figma.currentUser.name : 'Unknown User';
    const currentUserPhoto = figma.currentUser ? figma.currentUser.photoUrl : null;
    
    const checksWithTimestamps = {
      appropriateFile: {
        checked: manualChecks.appropriateFile,
        timestamp: manualChecks.appropriateFile ? 
          (existingChecks.appropriateFile && existingChecks.appropriateFile.timestamp ? existingChecks.appropriateFile.timestamp : timestamp) : null,
        user: manualChecks.appropriateFile ? 
          (existingChecks.appropriateFile && existingChecks.appropriateFile.user ? existingChecks.appropriateFile.user : currentUser) : null,
        userPhoto: manualChecks.appropriateFile ? 
          (existingChecks.appropriateFile && existingChecks.appropriateFile.userPhoto ? existingChecks.appropriateFile.userPhoto : currentUserPhoto) : null
      },
      annotations: {
        checked: manualChecks.annotations,
        timestamp: manualChecks.annotations ? 
          (existingChecks.annotations && existingChecks.annotations.timestamp ? existingChecks.annotations.timestamp : timestamp) : null,
        user: manualChecks.annotations ? 
          (existingChecks.annotations && existingChecks.annotations.user ? existingChecks.annotations.user : currentUser) : null,
        userPhoto: manualChecks.annotations ? 
          (existingChecks.annotations && existingChecks.annotations.userPhoto ? existingChecks.annotations.userPhoto : currentUserPhoto) : null
      },
      fsgApproval: {
        checked: manualChecks.fsgApproval,
        timestamp: manualChecks.fsgApproval ? 
          (existingChecks.fsgApproval && existingChecks.fsgApproval.timestamp ? existingChecks.fsgApproval.timestamp : timestamp) : null,
        user: manualChecks.fsgApproval ? 
          (existingChecks.fsgApproval && existingChecks.fsgApproval.user ? existingChecks.fsgApproval.user : currentUser) : null,
        userPhoto: manualChecks.fsgApproval ? 
          (existingChecks.fsgApproval && existingChecks.fsgApproval.userPhoto ? existingChecks.fsgApproval.userPhoto : currentUserPhoto) : null
      },
      prototype: {
        checked: manualChecks.prototype,
        timestamp: manualChecks.prototype ? 
          (existingChecks.prototype && existingChecks.prototype.timestamp ? existingChecks.prototype.timestamp : timestamp) : null,
        user: manualChecks.prototype ? 
          (existingChecks.prototype && existingChecks.prototype.user ? existingChecks.prototype.user : currentUser) : null,
        userPhoto: manualChecks.prototype ? 
          (existingChecks.prototype && existingChecks.prototype.userPhoto ? existingChecks.prototype.userPhoto : currentUserPhoto) : null
      },
      radiusComponents: {
        checked: manualChecks.radiusComponents,
        timestamp: manualChecks.radiusComponents ? 
          (existingChecks.radiusComponents && existingChecks.radiusComponents.timestamp ? existingChecks.radiusComponents.timestamp : timestamp) : null,
        user: manualChecks.radiusComponents ? 
          (existingChecks.radiusComponents && existingChecks.radiusComponents.user ? existingChecks.radiusComponents.user : currentUser) : null,
        userPhoto: manualChecks.radiusComponents ? 
          (existingChecks.radiusComponents && existingChecks.radiusComponents.userPhoto ? existingChecks.radiusComponents.userPhoto : currentUserPhoto) : null
      }
    };
    
    figma.currentPage.setPluginData(pageKey, JSON.stringify(checksWithTimestamps));
    
    // Send the updated data back to UI
    figma.ui.postMessage({ 
      type: 'checks-updated', 
      checks: checksWithTimestamps 
    });
  } catch (error) {
    console.error('Error saving checks:', error);
  }
}

// Validation functions
function validateFrameNames() {
  // Get only top-level frames for naming validation
  const topLevelFrames = figma.currentPage.children.filter(node => node.type === "FRAME");
  
  // Performance logging
  console.log(`Validating ${topLevelFrames.length} top-level frames (not scanning nested frames)`);
  
  const issues = [];
  
    // Check for various naming issues
  topLevelFrames.forEach(frame => {
    const name = frame.name || "";
    console.log(`Checking frame: "${name}" (${name.length} chars)`);
    
    // Skip Overview Board frames from naming validation
    if (name.toLowerCase().includes("overview") && name.toLowerCase().includes("board")) {
      console.log(`Skipping Overview Board frame: "${name}"`);
      return;
    }
    
    // Check for generic names
    if (!name || name === "Frame" || name === "Rectangle" || name === "Ellipse") {
      console.log(`Frame "${name}" flagged as generic name`);
      issues.push({ frame: frame, issue: "Generic name", name: name || "Unnamed" });
    }
    
    // Check if name contains "frame" (case insensitive)
    if (name.toLowerCase().includes("frame")) {
      console.log(`Frame "${name}" flagged as containing 'frame'`);
      issues.push({ frame: frame, issue: "Contains 'frame'", name: name });
    }
    
    // Check for short names (less than 15 characters)
    if (name.length < 15) {
      console.log(`Frame "${name}" flagged as too short (${name.length} chars)`);
      issues.push({ frame: frame, issue: "Too short", name: name });
    }
  });
  
  // Check for duplicate names
  const nameCounts = {};
  topLevelFrames.forEach(frame => {
    const name = frame.name || "";
    nameCounts[name] = (nameCounts[name] || 0) + 1;
  });
  
  // Find duplicates
  Object.entries(nameCounts).forEach(([name, count]) => {
    if (count > 1) {
      const duplicateFrames = topLevelFrames.filter(frame => frame.name === name);
      duplicateFrames.forEach(frame => {
        issues.push({ frame: frame, issue: "Duplicate name", name: name });
      });
    }
  });
  
  return {
    passed: issues.length === 0,
    count: issues.length,
    totalFrames: topLevelFrames.length,
    details: issues.map(issue => `${issue.name} (${issue.issue})`),
    issues: issues
  };
}

function validateOverviewBoard() {
  // Get only top-level frames (direct children of the page)
  const topLevelFrames = figma.currentPage.children.filter(node => node.type === "FRAME");
  const overviewBoard = topLevelFrames.find(frame => 
    frame.name.toLowerCase().includes("overview") || 
    frame.name.toLowerCase().includes("board")
  );
  
  return {
    passed: !!overviewBoard,
    found: overviewBoard ? overviewBoard.name : null
  };
}

function validateSections() {
  // Get only top-level frames (direct children of the page)
  const topLevelFrames = figma.currentPage.children.filter(node => node.type === "FRAME");
  const sections = figma.currentPage.findAll(node => node.type === "SECTION");
  
  // Filter out Overview Board frames from section validation
  const framesToCheck = topLevelFrames.filter(frame => {
    const name = frame.name || "";
    return !(name.toLowerCase().includes("overview") && name.toLowerCase().includes("board"));
  });
  
  // Check if top-level frames are inside sections
  const framesInSections = framesToCheck.filter(frame => {
    let parent = frame.parent;
    while (parent) {
      if (parent.type === "SECTION") return true;
      parent = parent.parent;
    }
    return false;
  });
  
  return {
    passed: framesInSections.length === framesToCheck.length,
    totalFrames: framesToCheck.length,
    framesInSections: framesInSections.length
  };
}

// Load saved peer review data from current page
async function loadPeerReview() {
  try {
    const pageKey = `peerReview_${figma.currentPage.id}`;
    const pageData = figma.currentPage.getPluginData(pageKey);
    let savedPeerReview;

    if (pageData) {
      savedPeerReview = JSON.parse(pageData);
    } else {
      // No saved data for this page - start with empty state
      savedPeerReview = {
        reviewed: false,
        comments: [],
        timestamp: null,
        user: null
      };
    }

    // Send saved state to UI
    figma.ui.postMessage({
      type: 'load-peer-review',
      peerReview: savedPeerReview
    });
  } catch (error) {
    console.error('Error loading peer review data:', error);
    // Fallback to empty state
    figma.ui.postMessage({
      type: 'load-peer-review',
      peerReview: {
        reviewed: false,
        comments: [],
        timestamp: null,
        user: null
      }
    });
  }
}

// Save peer review data to current page (shared across users)
async function savePeerReview(peerReviewData) {
  try {
    const pageKey = `peerReview_${figma.currentPage.id}`;
    const timestamp = new Date().toISOString();
    const currentUser = figma.currentUser ? figma.currentUser.name : 'Unknown User';
    const currentUserPhoto = figma.currentUser ? figma.currentUser.photoUrl : null;

    // Get existing data to preserve timestamp if already reviewed
    const existingData = figma.currentPage.getPluginData(pageKey);
    let existingPeerReview = {};

    if (existingData) {
      try {
        existingPeerReview = JSON.parse(existingData);
      } catch (error) {
        console.error('Error parsing existing peer review data:', error);
        existingPeerReview = {};
      }
    }

    // Create updated peer review data
    const updatedPeerReview = {
      reviewed: peerReviewData.reviewed,
      comments: existingPeerReview.comments || [],
      timestamp: peerReviewData.reviewed ? 
        (existingPeerReview.timestamp ? existingPeerReview.timestamp : timestamp) : null,
      user: peerReviewData.reviewed ? 
        (existingPeerReview.user ? existingPeerReview.user : currentUser) : null,
      userPhoto: peerReviewData.reviewed ? 
        (existingPeerReview.userPhoto ? existingPeerReview.userPhoto : currentUserPhoto) : null
    };

    figma.currentPage.setPluginData(pageKey, JSON.stringify(updatedPeerReview));

    // Send the updated data back to UI
    figma.ui.postMessage({
      type: 'peer-review-updated',
      peerReview: updatedPeerReview
    });
  } catch (error) {
    console.error('Error saving peer review:', error);
  }
}

// Add a comment to the peer review
async function addComment(commentText) {
  try {
    const pageKey = `peerReview_${figma.currentPage.id}`;
    const timestamp = new Date().toISOString();
    const currentUser = figma.currentUser ? figma.currentUser.name : 'Unknown User';
    const currentUserPhoto = figma.currentUser ? figma.currentUser.photoUrl : null;

    // Get existing data
    const existingData = figma.currentPage.getPluginData(pageKey);
    let existingPeerReview = {
      reviewed: false,
      comments: [],
      timestamp: null,
      user: null
    };

    if (existingData) {
      try {
        existingPeerReview = JSON.parse(existingData);
        // Ensure comments array exists
        if (!existingPeerReview.comments) {
          existingPeerReview.comments = [];
        }
      } catch (error) {
        console.error('Error parsing existing peer review data:', error);
      }
    }

    // Create new comment with unique ID
    const newComment = {
      id: `${Date.now()}.${Math.random()}`, // String ID to avoid type issues
      text: commentText,
      user: currentUser,
      userPhoto: currentUserPhoto,
      timestamp: timestamp
    };

    // Add comment to the array
    existingPeerReview.comments.push(newComment);

    // Save updated data
    figma.currentPage.setPluginData(pageKey, JSON.stringify(existingPeerReview));

    // Send the updated data back to UI
    figma.ui.postMessage({
      type: 'comment-added',
      peerReview: existingPeerReview
    });
  } catch (error) {
    console.error('Error adding comment:', error);
  }
}

// Validate permission to uncheck peer review
async function validateUncheckPermission(currentReviewUser) {
  try {
    const currentUser = figma.currentUser ? figma.currentUser.name : 'Unknown User';
    
    if (currentUser === currentReviewUser) {
      // Same user - permission granted
      figma.ui.postMessage({
        type: 'uncheck-permission-granted'
      });
    } else {
      // Different user - permission denied
      figma.ui.postMessage({
        type: 'uncheck-permission-denied',
        originalReviewer: currentReviewUser
      });
    }
  } catch (error) {
    console.error('Error validating uncheck permission:', error);
    // On error, deny permission for safety
    figma.ui.postMessage({
      type: 'uncheck-permission-denied',
      originalReviewer: currentReviewUser || 'the original reviewer'
    });
  }
}

// Delete a comment (with permission check)
async function deleteComment(commentId, commentUser) {
  try {
    const currentUser = figma.currentUser ? figma.currentUser.name : 'Unknown User';
    
    // Check if current user can delete this comment
    if (currentUser !== commentUser) {
      figma.ui.postMessage({
        type: 'delete-permission-denied'
      });
      return;
    }
    
    const pageKey = `peerReview_${figma.currentPage.id}`;
    const existingData = figma.currentPage.getPluginData(pageKey);
    
    if (!existingData) return;
    
    let existingPeerReview = {};
    try {
      existingPeerReview = JSON.parse(existingData);
    } catch (error) {
      console.error('Error parsing peer review data:', error);
      return;
    }
    
    // Filter out the comment with matching ID
    if (existingPeerReview.comments) {
      existingPeerReview.comments = existingPeerReview.comments.filter((comment, index) => {
        // For old comments without IDs, generate a temporary ID based on content and index
        const actualCommentId = String(comment.id || `comment_${comment.timestamp}_${index}`);
        const targetCommentId = String(commentId);
        return actualCommentId !== targetCommentId;
      });
      
      // Save updated data
      figma.currentPage.setPluginData(pageKey, JSON.stringify(existingPeerReview));
      
      // Send updated data back to UI
      figma.ui.postMessage({
        type: 'comment-deleted',
        peerReview: existingPeerReview
      });
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
}

// Load saved checks when plugin starts
loadManualChecks();

// Load saved peer review data
loadPeerReview();

// Send current page name to UI
figma.ui.postMessage({ 
  type: 'page-info', 
  pageName: figma.currentPage.name 
});

// Run validation automatically on plugin load
const autoValidationResults = {
  frameNames: validateFrameNames(),
  overviewBoard: validateOverviewBoard(),
  sections: validateSections(),
  manualChecks: {}
};

figma.ui.postMessage({ 
  type: 'auto-validation-results', 
  results: autoValidationResults 
});

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
          if (msg.type === 'get-current-user') {
    // Send current user info to UI for permission checks
    const currentUser = figma.currentUser ? figma.currentUser.name : 'Unknown User';
    figma.ui.postMessage({
      type: 'current-user-info',
      currentUser: currentUser
    });
  } else if (msg.type === 'delete-comment') {
    deleteComment(msg.commentId, msg.commentUser);
  } else if (msg.type === 'run-validation') {
          const results = {
            frameNames: validateFrameNames(),
            overviewBoard: validateOverviewBoard(),
            sections: validateSections(),
            manualChecks: msg.manualChecks || {}
          };
    
    figma.ui.postMessage({ type: 'validation-results', results });
  }
  
  if (msg.type === 'save-manual-checks') {
    await saveManualChecks(msg.manualChecks);
  }
  
  if (msg.type === 'save-peer-review') {
    await savePeerReview(msg.peerReview);
  }
  
  if (msg.type === 'add-comment') {
    await addComment(msg.comment);
  }
  
  if (msg.type === 'validate-uncheck-permission') {
    await validateUncheckPermission(msg.currentReviewUser);
  }
  
  if (msg.type === 'select-frame') {
    try {
      const frame = figma.getNodeById(msg.frameId);
      if (frame) {
        figma.currentPage.selection = [frame];
        figma.viewport.scrollAndZoomIntoView([frame]);
      }
    } catch (error) {
      console.error('Error selecting frame:', error);
    }
  }
  
  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
}; 